import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { registerRequestBody, updateMeRequestBody } from '~/models/requests/User.requests'
import { hasPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { SignOptions } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpstatus'
import { USER_MESSAGE } from '~/constants/message'

class UsersService {
  private signAccessToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { userId, verify, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { userId, verify, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  private signEmailVerifyToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  async register(payload: registerRequestBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken(user_id.toString())

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password),
        email_verify_token: emailVerifyToken
      })
    )

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ userId: user_id.toString(), verify: UserVerifyStatus.Unverified }),
      this.signRefreshToken({ userId: user_id.toString(), verify: UserVerifyStatus.Unverified })
    ])
    // tương tự như vậy
    //     const accessToken = await this.signAccessToken({userId:user_id.toString(),verify:UserVerifyStatus.Unverified})
    // const refreshToken = await this.signRefreshToken({userId:user_id.toString(),verify:UserVerifyStatus.Unverified})

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id.toString()) })
    )

    return { accessToken, refreshToken }
  }

  async login({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ userId, verify }),
      this.signRefreshToken({ userId, verify })
    ])
    // delete old refresh token and insert new one
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(userId) })
    )

    return { accessToken, refreshToken }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: 'logout success'
    }
  }

  async refreshToken(refresh_token: string) {
    try {
      // 1. Xác minh token (giả sử bạn dùng JWT)
      const payload = await verifyToken({
        token: refresh_token,
        secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
      const userId = payload?.userId

      // 2. Kiểm tra token có tồn tại trong DB không
      const tokenInDb = await databaseService.refreshTokens.findOne({
        token: refresh_token,
        user_id: new ObjectId(userId)
      })

      if (!tokenInDb) {
        throw new Error('Refresh token không hợp lệ hoặc đã bị thu hồi')
      }

      const newAccessToken = await this.signAccessToken({ userId, verify: payload.verify })

      // 5. Trả về token mới
      return {
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      }
    } catch (err) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn')
    }
  }

  async verifyEmail(userId: string) {
    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
    )
    const accessToken = await this.signAccessToken({ userId, verify: UserVerifyStatus.Verified })
    const refreshToken = await this.signRefreshToken({ userId, verify: UserVerifyStatus.Verified })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(userId) })
    )
    return { message: 'Email verified successfully', accessToken, refreshToken }
  }

  async reSendVerifyEmail(userId: string) {
    const emailVerifyToken = await this.signEmailVerifyToken(userId)
    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { email_verify_token: emailVerifyToken, updated_at: new Date() } }
    )
    return { message: 'Re-send verify email successfully' }
  }

  async forgotPasswordService(userId: string) {
    const forgotPasswordToken = await this.signForgotPasswordToken(userId)

    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { forgot_password_token: forgotPasswordToken, updated_at: new Date() } }
    )
    return { forgotPasswordToken }
  }

  async resetPasswordService(userId: string, password: string) {
    await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { password: hasPassword(password), forgot_password_token: '', updated_at: new Date() } }
    )
    return { message: 'Reset password successfully' }
  }

  async getMe(userId: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    // neu user_id khong ton tai
    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }
  async updateMe(userId: string, payload: updateMeRequestBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { ...(_payload as updateMeRequestBody & { date_of_birth?: Date }), updated_at: new Date() } },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getProfileUserService(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
      return
    }
    return user
  }
}

const usersService = new UsersService()

export default usersService

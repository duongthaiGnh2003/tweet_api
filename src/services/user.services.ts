import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { registerRequestBody } from '~/models/requests/User.requests'
import { hasPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { SignOptions } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

class UsersService {
  private signAccessToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.RefreshToken },
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
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password),
        email_verify_token: emailVerifyToken
      })
    )

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])
    // tương tự như vậy
    //     const accessToken = await this.signAccessToken(userId)
    // const refreshToken = await this.signRefreshToken(userId)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id.toString()) })
    )

    return { accessToken, refreshToken }
  }

  async login(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
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

      const newAccessToken = await this.signAccessToken(userId)

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
    const accessToken = await this.signAccessToken(userId)
    const refreshToken = await this.signRefreshToken(userId)
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
}

const usersService = new UsersService()

export default usersService

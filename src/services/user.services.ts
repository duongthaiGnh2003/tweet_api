import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { registerRequestBody } from '~/models/requests/User.requests'
import { hasPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { SignOptions } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

class UsersService {
  private signAccessToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] }
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: { userId, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] }
    })
  }

  async register(payload: registerRequestBody) {
    const resuilt = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password)
      })
    )
    const userId = resuilt.insertedId.toString()
    const [accessToken, refreshToken] = await Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
    // tương tự như vậy
    //     const accessToken = await this.signAccessToken(userId)
    // const refreshToken = await this.signRefreshToken(userId)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(userId) })
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

  async refreshToken(oldToken: string) {
    try {
      // 1. Xác minh token (giả sử bạn dùng JWT)
      const payload = await verifyToken({ token: oldToken })
      const userId = payload?.userId

      // 2. Kiểm tra token có tồn tại trong DB không
      const tokenInDb = await databaseService.refreshTokens.findOne({
        token: oldToken,
        user_id: new ObjectId(userId)
      })

      if (!tokenInDb) {
        throw new Error('Refresh token không hợp lệ hoặc đã bị thu hồi')
      }

      // 3. (Tùy chọn) Xoá token cũ và tạo token mới (rotate)
      // await databaseService.refreshTokens.deleteOne({ token: oldToken });

      const newAccessToken = await this.signAccessToken(userId)

      // // 4. Lưu refresh token mới vào DB
      // await databaseService.refreshTokens.insertOne(
      //   new RefreshToken({
      //     token: newRefreshToken,
      //     user_id: new ObjectId(userId),
      //   })
      // );

      // 5. Trả về token mới
      return {
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      }
    } catch (err) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn')
    }
  }
}

const usersService = new UsersService()

export default usersService

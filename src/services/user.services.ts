import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { registerRequestBody } from '~/models/requests/User.requests'
import { hasPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
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
}

const usersService = new UsersService()

export default usersService

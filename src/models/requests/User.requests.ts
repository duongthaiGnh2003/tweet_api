import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'

export type registerRequestBody = {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export type LogoutRequestBody = {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  userId: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export type ForgotPasswordRequestBody = {
  email: string
}

export type updateMeRequestBody = {
  name?: string
  date_of_birth?: string
  bio?: string
  website?: string
  location?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface followAndUnfollowRequestParams extends ParamsDictionary {
  follow_User_Id: string
}

export type changePasswordRequestBody = {
  old_password: string
  password: string
  confirm_new_password: string
}

export type userinfoGoogleOauth = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
}

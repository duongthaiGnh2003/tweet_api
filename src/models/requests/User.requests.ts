import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

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
}

export type ForgotPasswordRequestBody = {
  email: string
}

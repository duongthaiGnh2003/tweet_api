import { Request } from 'express'
import { User } from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
declare module 'express' {
  // khai báo thêm các thuộc tính cho Request type trong express
  interface Request {
    user?: User
    decoded_email_verify_token?: TokenPayload
    decoded_authorization?: TokenPayload
    decoded_forgot_password_verify_token?: TokenPayload
  }
}

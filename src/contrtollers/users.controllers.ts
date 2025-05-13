import { NextFunction, Request, Response } from 'express'
import { LogoutRequestBody, registerRequestBody, TokenPayload } from '~/models/requests/User.requests'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { User } from '~/models/schemas/User.schema'
import HTTP_STATUS from '~/constants/httpstatus'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'

export async function registerController(
  req: Request<ParamsDictionary, any, registerRequestBody>,
  res: Response,
  next: NextFunction
) {
  const result = await usersService.register(req.body)
  res.json({
    data: 'create success',
    result: result
  })
}

export const loginController = async (req: Request, res: Response) => {
  const { user } = req as { user: User } // req.user được gán trong middleware

  try {
    const result = await usersService.login(user._id.toString())
    res.json({
      message: 'login success',
      data: result
    })
  } catch (error) {
    res.status(500).json({
      message: 'login failed',
      error: error
    })
  }
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const result = await usersService.logout(req.body.refresh_token)
  res.json({
    result: result
  })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const result = await usersService.refreshToken(req.body.refresh_token)

  res.json({
    data: result
  })
}

export const verifyEmailController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_email_verify_token as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  // neu user_id khong ton tai

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' })
    return
  }

  // // user da xac thuc email
  if (user.email_verify_token === '') {
    res.json({ message: 'Email already verified' })
    return
  }

  // // khi user chua xac thuc email
  const result = await usersService.verifyEmail(userId)
  res.json({
    result
  })
}

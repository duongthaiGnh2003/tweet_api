import { NextFunction, Request, Response } from 'express'
import {
  changePasswordRequestBody,
  followAndUnfollowRequestParams,
  ForgotPasswordRequestBody,
  LogoutRequestBody,
  registerRequestBody,
  TokenPayload,
  updateMeRequestBody
} from '~/models/requests/User.requests'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { User } from '~/models/schemas/User.schema'
import HTTP_STATUS from '~/constants/httpstatus'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { USER_MESSAGE } from '~/constants/message'
import { UserVerifyStatus } from '~/constants/enums'
import { pick } from 'lodash'

export async function registerController(
  req: Request<ParamsDictionary, any, registerRequestBody>,
  res: Response,
  next: NextFunction
) {
  const result = await usersService.register(req.body)
  res.json({
    message: 'create success',
    data: result
  })
}

export const loginController = async (req: Request, res: Response) => {
  const { user } = req as { user: User } // req.user được gán trong middleware

  try {
    const result = await usersService.login({ userId: user._id.toString(), verify: user.verify })
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
    data: result
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
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGE.USER_NOT_FOUND })
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
    data: result
  })
}

export const reSendVerifyEmailController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  // neu user_id khong ton tai

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGE.USER_NOT_FOUND })
    return
  }

  // user da xac thuc email
  if (user.verify === UserVerifyStatus.Verified) {
    res.json({ message: 'Email already verified' })
    return
  }

  // // khi user chua xac thuc email
  const result = await usersService.reSendVerifyEmail(userId)
  res.json({
    data: result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { user } = req as { user: User } // req.user được gán trong middleware
  const result = await usersService.forgotPasswordService(user._id.toString())
  res.json({
    message: 'forgot password success',
    data: result
  })
}

export const forgotPasswordVerifyController = async (req: Request, res: Response) => {
  res.json({
    message: 'forgot password verify success'
  })
}
export const resetPasswordController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_forgot_password_verify_token as TokenPayload

  const result = await usersService.resetPasswordService(userId, req.body.password)
  res.json({
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(userId)

  res.json({
    data: result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, updateMeRequestBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const body = pick(req.body, [
    'name',
    'date_of_birth',
    'bio',
    'website',
    'location',
    'username',
    'avatar',
    'cover_photo'
  ]) // chỉ lấy các trường cần thiết trong body cho dù user gửi lên những trường khác
  const result = await usersService.updateMe(userId, body as Partial<updateMeRequestBody>)

  res.json({
    message: 'update success',
    data: result
  })
}

export const getProfileUserController = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfileUserService(username)

  res.json({
    data: result
  })
}

export const followUserController = async (req: Request<followAndUnfollowRequestParams>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { follow_User_Id } = req.params as followAndUnfollowRequestParams

  const result = await usersService.followUserService(userId, follow_User_Id)

  res.json({
    ...result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, changePasswordRequestBody>,
  res: Response
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { password, old_password } = req.body

  const result = await usersService.changePasswordService(userId, old_password, password)

  res.json({ ...result })
}

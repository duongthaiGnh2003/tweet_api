import { NextFunction, Request, Response } from 'express'
import { registerRequestBody } from '~/models/requests/User.requests'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { User } from '~/models/schemas/User.schema'

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

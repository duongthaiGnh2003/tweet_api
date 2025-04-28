import { Request, Response } from 'express'
import { registerRequestBody } from '~/models/requests/User.requests'
import usersService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email && password) {
    res.json({
      message: 'Login success ssss'
    })
  }

  res.status(400).json({
    error: 'Login failed'
  })
}

export async function registerController(req: Request<ParamsDictionary, any, registerRequestBody>, res: Response) {
  const result = await usersService.register(req.body)
  res.json({
    data: 'create success',
    result: result
  })
}

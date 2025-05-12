import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/contrtollers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default usersRouter

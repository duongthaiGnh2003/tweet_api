import { Router } from 'express'

import {
  changePasswordController,
  followUserController,
  forgotPasswordController,
  forgotPasswordVerifyController,
  getMeController,
  getProfileUserController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  reSendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController
} from '~/contrtollers/users.controllers'
import {
  accessTokenCookieValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  forgotPasswordVerifyValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyUserValidator
} from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenCookieValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenCookieValidator, wrapRequestHandler(reSendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password-token',
  forgotPasswordVerifyValidator,
  wrapRequestHandler(forgotPasswordVerifyController)
)

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get('/me', accessTokenCookieValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/me',
  accessTokenCookieValidator,
  verifyUserValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)

usersRouter.get('/:username', wrapRequestHandler(getProfileUserController))

usersRouter.post(
  '/follow/:follow_User_Id',
  accessTokenCookieValidator,
  verifyUserValidator,
  wrapRequestHandler(followUserController)
)

usersRouter.patch(
  '/change-password',
  accessTokenCookieValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

export default usersRouter

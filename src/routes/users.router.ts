import { Router } from 'express'
import { loginController, registerController } from '~/contrtollers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter

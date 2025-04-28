import { Router } from 'express'
import { loginController, registerController } from '~/contrtollers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/user.middlewares'
import { validate } from '~/utils/validator'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter

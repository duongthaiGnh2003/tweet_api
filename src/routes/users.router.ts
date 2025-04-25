import { Router } from 'express'
import { loginController } from '~/contrtollers/users.controllers'
import { loginValidator } from '~/middlewares/user.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

export default usersRouter

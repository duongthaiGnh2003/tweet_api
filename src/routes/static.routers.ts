import { Router } from 'express'
import { staticGetFileController } from '~/contrtollers/media.ccontrollers'

export const staticRouter = Router()

staticRouter.get('/image/:name', staticGetFileController)

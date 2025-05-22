import { Router } from 'express'
import { staticGetFileController, staticGetFileVideoController } from '~/contrtollers/media.ccontrollers'

export const staticRouter = Router()

staticRouter.get('/image/:name', staticGetFileController)
staticRouter.get('/video/:name', staticGetFileVideoController)

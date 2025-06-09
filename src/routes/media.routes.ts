import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videotatusController
} from '~/contrtollers/media.ccontrollers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import CustomFileImg from '~/utils/customFileImg'
import { wrapRequestHandler } from '~/utils/handelers'

export const mediasRouter = Router()
// mediasRouter.post('/upload-image', CustomFileImg().single('file'), uploadSingleImageController)
mediasRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video', accessTokenValidator, wrapRequestHandler(uploadVideoController))
mediasRouter.post('/upload-video-hsl', accessTokenValidator, wrapRequestHandler(uploadVideoHLSController))
mediasRouter.get('/video-status/:id', accessTokenValidator, wrapRequestHandler(videotatusController))

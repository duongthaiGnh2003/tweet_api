import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/contrtollers/media.ccontrollers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import CustomFileImg from '~/utils/customFileImg'
import { wrapRequestHandler } from '~/utils/handelers'

export const mediasRouter = Router()
// mediasRouter.post('/upload-image', CustomFileImg().single('file'), uploadSingleImageController)
mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video', wrapRequestHandler(uploadVideoController))

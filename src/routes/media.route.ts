import { Router } from 'express'
import { uploadSingleImageController } from '~/contrtollers/media.ccontrollers'
import CustomFileImg from '~/utils/customFileImg'
import { wrapRequestHandler } from '~/utils/handelers'

export const mediasRouter = Router()
// mediasRouter.post('/upload-image', CustomFileImg().single('file'), uploadSingleImageController)
mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

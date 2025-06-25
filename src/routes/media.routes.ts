import { NextFunction, Request, Response, Router } from 'express'
import { ModeUploaldFile } from '~/constants/enums'
import {
  uploadImageController,
  uploadImageToCloundinaryController,
  uploadVideoController,
  uploadVideoHLSController,
  uploadVideoToCloundinaryController,
  videotatusController
} from '~/contrtollers/media.ccontrollers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { handleUploadImageToCloundinary, handleUploadVideoToCloundinary } from '~/utils/fileMulter'

import { wrapRequestHandler } from '~/utils/handelers'

export const mediasRouter = Router()
// mediasRouter.post('/upload-image', CustomFileImg().single('file'), uploadSingleImageController)
mediasRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video', accessTokenValidator, wrapRequestHandler(uploadVideoController))
mediasRouter.post('/upload-video-hsl', accessTokenValidator, wrapRequestHandler(uploadVideoHLSController))
mediasRouter.get('/video-status/:id', accessTokenValidator, wrapRequestHandler(videotatusController))

// ToCloundinary
mediasRouter.post(
  '/upload-image-clound',
  (req: Request, res: Response, next: NextFunction) => {
    const upload = handleUploadImageToCloundinary(req)
    const isMultiple = Number(req.query.mode) === ModeUploaldFile.mutyplite
    const middleware = isMultiple ? upload.array('file', 10) : upload.single('file')
    middleware(req, res, next)
  },

  accessTokenValidator,
  wrapRequestHandler(uploadImageToCloundinaryController)
)

mediasRouter.post(
  '/upload-video-clound',
  (req: Request, res: Response, next: NextFunction) => {
    const upload = handleUploadVideoToCloundinary(req)
    const isMultiple = Number(req.query.mode) === ModeUploaldFile.mutyplite
    const middleware = isMultiple ? upload.array('file', 10) : upload.single('file')
    middleware(req, res, next)
  },

  accessTokenValidator,
  wrapRequestHandler(uploadVideoToCloundinaryController)
)

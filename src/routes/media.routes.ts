import { NextFunction, Request, Response, Router } from 'express'
import { ModeUploaldFile } from '~/constants/enums'
import {
  uploadImageController,
  uploadImageToCloundinaryController,
  uploadMediaToCloundinaryController,
  uploadVideoController,
  uploadVideoHLSController,
  uploadVideoToCloundinaryController,
  videotatusController
} from '~/contrtollers/media.ccontrollers'
import { accessTokenCookieValidator } from '~/middlewares/user.middlewares'
import {
  handleUploadImageToCloundinary,
  handleUploadMediaToCloundinary,
  handleUploadVideoToCloundinary
} from '~/utils/fileMulter'

import { wrapRequestHandler } from '~/utils/handelers'

export const mediasRouter = Router()
// mediasRouter.post('/upload-image', CustomFileImg().single('file'), uploadSingleImageController)
mediasRouter.post('/upload-image', accessTokenCookieValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video', accessTokenCookieValidator, wrapRequestHandler(uploadVideoController))
mediasRouter.post('/upload-video-hsl', accessTokenCookieValidator, wrapRequestHandler(uploadVideoHLSController))
mediasRouter.get('/video-status/:id', accessTokenCookieValidator, wrapRequestHandler(videotatusController))

// ToCloundinary
mediasRouter.post(
  '/upload-image-clound',
  (req: Request, res: Response, next: NextFunction) => {
    const upload = handleUploadImageToCloundinary(req)
    const isMultiple = Number(req.query.mode) === ModeUploaldFile.mutyplite
    const middleware = isMultiple ? upload.array('file', 10) : upload.single('file')
    middleware(req, res, next)
  },

  accessTokenCookieValidator,
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

  accessTokenCookieValidator,
  wrapRequestHandler(uploadVideoToCloundinaryController)
)

mediasRouter.post(
  '/upload-media-clound',

  handleUploadMediaToCloundinary().array('file', 10),

  accessTokenCookieValidator,
  wrapRequestHandler(uploadMediaToCloundinaryController)
)

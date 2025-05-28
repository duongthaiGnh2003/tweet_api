import { Router } from 'express'
import {
  serveM3u8HLSController,
  serveSegmentHLSController,
  staticGetFileController,
  staticGetFileVideoStreamController
} from '~/contrtollers/media.ccontrollers'

export const staticRouter = Router()

staticRouter.get('/image/:name', staticGetFileController)
staticRouter.get('/video/:name', staticGetFileVideoStreamController)
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8HLSController)
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentHLSController)

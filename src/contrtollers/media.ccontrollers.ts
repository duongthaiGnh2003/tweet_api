import { Request, Response } from 'express'
import path from 'path'
import { DIR_UPLOADS_IMAGE, DIR_UPLOADS_VIDEO } from '~/constants/config'
import mediaService from '~/services/media.services'
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response) => {
  const data = await mediaService.uploadMedia(req)

  res.json({
    message: ' upload is success ',
    data: data
  })
}

// export const uploadSingleImageController = (req: Request, res: Response) => {
//   if (!req.file) {
//     res.status(400).json({
//       message: 'No file uploaded'
//     })
//     return
//   }
//   res.json({
//     message: 'upload success'
//   })
// }
export const uploadVideoController = async (req: Request, res: Response) => {
  const data = await mediaService.uploadVideo(req)

  res.json({
    message: ' upload is success ',
    data: data
  })
}

export const staticGetFileController = (req: Request, res: Response) => {
  const { name } = req.params

  return res.sendFile(path.resolve(DIR_UPLOADS_IMAGE, name), (err) => {
    if (err) {
      res.status((err as any).status).send('file is not found')
    }
  })
}

export const staticGetFileVideoController = (req: Request, res: Response) => {
  const { name } = req.params
  const filePath = path.resolve(DIR_UPLOADS_VIDEO, name)

  // Thiết lập MIME type nếu cần
  res.type('video/mp4') // Nếu chỉ hỗ trợ mp4

  return res.sendFile(filePath, (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status((err as any).status || 500).send('File is not found')
      } else {
        console.error('Error after headers sent:', err)
      }
    }
  })
}

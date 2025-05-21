import { Request, Response } from 'express'
import path from 'path'
import { DIR_UPLOADS_PATH } from '~/constants/config'
import mediaService from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
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

export const staticGetFileController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(DIR_UPLOADS_PATH, name), (err) => {
    if (err) {
      res.status((err as any).status).send('file is not found')
    }
  })
}

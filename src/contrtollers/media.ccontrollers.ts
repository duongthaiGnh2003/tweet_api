import { Request, Response } from 'express'
import mediaService from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await mediaService.uploadMedia(req)

  res.json({
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

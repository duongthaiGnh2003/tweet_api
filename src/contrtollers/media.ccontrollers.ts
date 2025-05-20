import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const data = await handleUploadSingleImage(req)
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

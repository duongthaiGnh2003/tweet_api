import { Request, Response } from 'express'
import path from 'path'
import { DIR_UPLOADS_IMAGE, DIR_UPLOADS_VIDEO } from '~/constants/config'
import mediaService from '~/services/media.services'
import fs from 'fs'
import HTTP_STATUS from '~/constants/httpstatus'
import mime from 'mime'

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
  const range = req.headers.range as string
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(DIR_UPLOADS_VIDEO, name)

  // 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ mà chúng ta hay thấy trên UI)
  // Còn nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 x 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size

  // Dung lượng video cho mỗi phần đoạn stream
  const chunkSize = 10 ** 6 // 1MB

  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=1048576-)
  const start = Number(range.replace(/\D/g, ''))

  // Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  const contentLength = end - start + 1

  // Xác định loại mime của video, mặc định video/*
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)

  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

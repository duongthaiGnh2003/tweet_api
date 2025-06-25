import { Request } from 'express'
import multer, { diskStorage, memoryStorage } from 'multer' // 👈 thay vì diskStorage
import path from 'path'
import { ModeUploaldFile } from '~/constants/enums'

export function handleUploadImageToCloundinary(req: Request) {
  const { mode } = req.query
  const isMutyplite = Number(mode) === ModeUploaldFile.mutyplite

  return multer({
    storage: memoryStorage(),
    limits: {
      fileSize: isMutyplite ? 20 * 1024 * 1024 : 10 * 1024 * 1024 // 20MB or 10MB per file
    },

    fileFilter: (req, file, cb: any) => {
      const isImage = file.mimetype?.includes('image/')
      if (!isImage) {
        cb(new Error('Unsupported file type'), false)
      }
      cb(null, true)
    }
  })
}

export function handleUploadVideoToCloundinary(req: Request) {
  const { mode } = req.query
  const isMutyplite = Number(mode) === ModeUploaldFile.mutyplite
  return multer({
    storage: memoryStorage(),
    limits: {
      fileSize: isMutyplite ? 20 * 1024 * 1024 : 10 * 1024 * 1024 // 20MB or 3MB per file
      // files: isMutyplite ? 20 : 1 // Số lượng file tùy chế độ
    },

    fileFilter: (req, file, cb: any) => {
      const isImage = file.mimetype?.includes('video')
      if (!isImage) {
        cb(new Error('Unsupported file type'), false)
      }
      cb(null, true)
    }
  })
}

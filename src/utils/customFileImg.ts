import multer, { diskStorage } from 'multer' // 👈 thay vì diskStorage

function CustomFileImg() {
  return multer({
    storage: diskStorage({
      // cho local
      destination: './uploads', // nơi lưu trữ file
      filename: (req, file, cb) => {
        const name = Date.now() + '_' + file.originalname
        cb(null, name)
      }
    }),

    limits: {
      fieldSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true)
      } else {
        cb(new Error('Unsupported file type'), false)
      }
    }
  })
}

export default CustomFileImg

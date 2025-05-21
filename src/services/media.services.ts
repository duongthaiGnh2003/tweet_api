import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR_UPLOADS_PATH, isProduction } from '~/constants/config'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'

class MediaService {
  async uploadMedia(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const info = await sharp(file.filepath)
      .jpeg({ quality: 70 })
      .toFile(DIR_UPLOADS_PATH + `/${newName}.jpg`)

    return isProduction
      ? `${process.env.HOST}/uploads/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`
  }
}
const mediaService = new MediaService()
export default mediaService

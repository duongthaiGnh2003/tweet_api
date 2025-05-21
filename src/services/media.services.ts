import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'

class MediaService {
  async uploadMedia(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const info = await sharp(file.filepath)
      .jpeg({ quality: 70 })
      .toFile(path.resolve('uploads') + `/${newName}.jpg`)
    console.log(path.resolve(path.resolve('uploads') + `${newName}.jpg`))
    return file
  }
}
const mediaService = new MediaService()
export default mediaService

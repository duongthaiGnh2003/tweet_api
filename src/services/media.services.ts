import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR_UPLOADS_IMAGE, isProduction } from '~/constants/config'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'

class MediaService {
  async uploadMedia(req: Request) {
    const files = await handleUploadImage(req)

    const data = await Promise.all(
      files.map(async (file, index) => {
        const newName = getNameFromFullName(file.newFilename)

        await sharp(file.filepath)
          .jpeg()
          .toFile(DIR_UPLOADS_IMAGE + `/${newName}.jpg`)

        return isProduction
          ? `${process.env.HOST}/static/image/${newName}.jpg`
          : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`
      })
    )

    return data
  }
  async uploadVideoService(req: Request) {
    const files = await handleUploadVideo(req)

    const data = await Promise.all(
      files.map(async (file, index) => {
        // await sharp(file.filepath)
        //   .jpeg()
        //   .toFile(DIR_UPLOADS_VIDEO + `/${newName}.mp4`)

        return isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}.mp4`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}.mp4`
      })
    )

    return data
  }
  async uploadVideoHLSService(req: Request) {
    const files = await handleUploadVideo(req)

    const data = await Promise.all(
      files.map(async (file, index) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullName(file.newFilename)
        await fsPromise.unlink(file.filepath)
        return isProduction
          ? `${process.env.HOST}/static/video-hls/${newName}`
          : `http://localhost:${process.env.PORT}/static/video-hls/${newName}`
      })
    )

    return data
  }
}
const mediaService = new MediaService()
export default mediaService

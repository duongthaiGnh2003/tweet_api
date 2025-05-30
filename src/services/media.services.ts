import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR_UPLOADS_IMAGE, isProduction } from '~/constants/config'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    ;(this.items = []), (this.encoding = false)
  }
  enqueue(item: string) {
    this.items.push(item)
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        console.log(`Encode video ${videoPath} success`)
      } catch (err) {
        console.log(`Encode video ${videoPath} error`)
        console.log(err)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}
const queue = new Queue()
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
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        return isProduction
          ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
          : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`
      })
    )

    return data
  }
}
const mediaService = new MediaService()
export default mediaService

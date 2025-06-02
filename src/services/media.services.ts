import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR_UPLOADS_IMAGE, isProduction } from '~/constants/config'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { EncodingStatus } from '~/constants/enums'
class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    ;(this.items = []), (this.encoding = false)
  }
  async enqueue(item: string) {
    this.items.push(item)

    const idName = getNameFromFullName(item.split('/').pop() as string)
      .split('\\')
      .at(-1) as string

    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]

      const idName = getNameFromFullName(videoPath.split('/').pop() as string)
        .split('\\')
        .at(-1) as string
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            update_at: true
          }
        }
      )

      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              update_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (err) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                update_at: true
              }
            }
          )
          .catch((err) => {
            console.log('update video status err', err)
          })
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
        const folderVideo = file.newFilename.split('.')[0]
        return isProduction
          ? `${process.env.HOST}/static/video/${folderVideo}/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${folderVideo}/${file.newFilename}`
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

  async getVideoStatusService(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}
const mediaService = new MediaService()
export default mediaService

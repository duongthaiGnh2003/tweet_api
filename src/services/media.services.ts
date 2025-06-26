import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR_UPLOADS_IMAGE, isProduction } from '~/constants/config'
import { getNameFromFullName, handleUploadImage, handleUploadVideo, handleUploadVideoToClound } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { EncodingStatus, MediaType, ModeUploaldFile } from '~/constants/enums'
import fs from 'fs/promises'
import { v2 as cloudinary } from 'cloudinary'
import { handleUploadImageToCloundinary } from '~/utils/fileMulter'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpstatus'
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
    // luu vào ổ cứng local
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

  async uploadImageToCloundinaryService(req: Request) {
    try {
      const files =
        Number(req.query.mode) === ModeUploaldFile.single
          ? ([req.file] as Express.Multer.File[])
          : (req.files as Express.Multer.File[])

      const uploadResults = await Promise.all(
        files.map(async (file) => {
          const compressedBuffer = await sharp(file.buffer) /// giảm dung lượng ảnh
            .jpeg() // Optional: set quality
            .toBuffer()

          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'tweeter/images',
                resource_type: 'image'
              },
              (error, result) => {
                if (error) return reject(error)
                resolve(result?.secure_url)
              }
            )

            stream.end(compressedBuffer) // dùng buffer thay vì path
          })
        })
      )

      return uploadResults
    } catch (error) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Upload failed' })
    }
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
  async uploadVideoToCloundinaryService(req: Request) {
    try {
      const files =
        Number(req.query.mode) === ModeUploaldFile.single
          ? ([req.file] as Express.Multer.File[])
          : (req.files as Express.Multer.File[])
      const uploadResults = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'tweeter/videos',
                resource_type: 'video'
              },
              (error, result) => {
                if (error) return reject(error)

                resolve(result?.playback_url as string)
              }
            )
            stream.end(file.buffer)
          })
        })
      )

      return uploadResults // 👈 Trả về mảng URL của các video đã upload
    } catch (error) {
      console.log(error)
      throw new ErrorWithStatus({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Upload failed'
      })
    }
  }
  async getVideoStatusService(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }

  async uploadMediaToCloundinaryService(req: Request) {
    try {
      const files = req.files as Express.Multer.File[]

      const uploadResults = await Promise.all(
        files.map(async (file) => {
          if (file.mimetype.includes('image/')) {
            const compressedBuffer = await sharp(file.buffer) /// giảm dung lượng ảnh
              .jpeg() // Optional: set quality
              .toBuffer()

            return new Promise<{ type: MediaType; url: string }>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: 'tweeter/images',
                  resource_type: 'image'
                },
                (error, result) => {
                  if (error) return reject(error)
                  resolve({
                    type: MediaType.Image,
                    url: result?.secure_url as string
                  })
                }
              )

              stream.end(compressedBuffer) // dùng buffer thay vì path
            })
          } else if (file.mimetype.includes('video/')) {
            return new Promise<{ type: MediaType; url: string }>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: 'tweeter/videos',
                  resource_type: 'video'
                },
                (error, result) => {
                  if (error) return reject(error)

                  resolve({ type: MediaType.HLS, url: result?.playback_url })
                }
              )
              stream.end(file.buffer)
            })
          }
        })
      )

      return uploadResults
    } catch (error) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Upload failed' })
    }
  }
}
const mediaService = new MediaService()
export default mediaService

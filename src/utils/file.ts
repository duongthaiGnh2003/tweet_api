import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { nanoid } from 'nanoid'

import path from 'path'
import { DIR_UPLOADS_VIDEO } from '~/constants/config'
import { ModeUploaldFile } from '~/constants/enums'

export const handleUploadImage = async (req: Request) => {
  const { mode } = req.query

  const isMutyplite = Number(mode) === ModeUploaldFile.mutyplite

  const form = formidable({
    uploadDir: path.resolve('uploads/images/temp'),
    maxFiles: isMutyplite ? 20 : 1,
    keepExtensions: true,
    maxFieldsSize: 3 * 1024 * 1024, // 3MB
    maxTotalFileSize: 3 * 1024 * 1024 * 20, //60mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Unsupported file type') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files?.image)) {
        return reject(new Error('file is empty'))
      }

      resolve(files?.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const { mode } = req.query

  const isMutyplite = Number(mode) === ModeUploaldFile.mutyplite
  const idName = nanoid(10)
  const folderPath = path.resolve(DIR_UPLOADS_VIDEO, idName)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: isMutyplite ? 5 : 1,

    maxFieldsSize: 30 * 1024 * 1024, // 30MB
    maxTotalFileSize: 30 * 1024 * 1024 * 5, //150
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      if (!valid) {
        form.emit('error' as any, new Error('Unsupported file type') as any)
      }
      return valid
    },
    filename() {
      return idName
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!Boolean(files?.video)) {
        return reject(new Error('file is empty'))
      }
      const videos = files.video as File[]

      videos.forEach((video) => {
        const ext = getExtention(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        video.newFilename = video.newFilename + '.' + ext // Update newFilename to include the extension
        video.filepath = video.filepath + '.' + ext
      })

      resolve(files?.video as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('')
}
export const getExtention = (fullName: string) => {
  const namearr = fullName.split('.')

  return namearr[namearr.length - 1]
}

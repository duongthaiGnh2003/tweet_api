import { Request } from 'express'
import formidable from 'formidable'

import path from 'path'

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFields: 1,
    keepExtensions: true,
    maxFieldsSize: 3 * 1024 * 1024, // 3MB
    filter: function ({ name, originalFilename, mimetype }) {
      console.log('file', { name, originalFilename, mimetype })
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Unsupported file type') as any)
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files?.image)) {
        return reject(new Error('file is empty'))
      }
      resolve(files)
    })
  })
}

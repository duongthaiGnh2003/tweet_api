import minimist from 'minimist'
import path from 'path'

var options = minimist(process.argv.slice(2))
export const isProduction = Boolean(options.production)

export const DIR_UPLOADS_IMAGE = path.resolve('uploads/images')
export const DIR_UPLOADS_VIDEO = path.resolve('uploads/videos')

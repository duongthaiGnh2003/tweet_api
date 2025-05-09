import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpstatus'
import { ErrorWithStatus } from '~/models/Errors'
import { omit } from 'lodash'

const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {
      enumerable: true
    })
  })

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    err: omit(err, ['stack'])
  })
}
export default defaultErrorHandler

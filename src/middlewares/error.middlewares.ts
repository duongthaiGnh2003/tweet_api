import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpstatus'

const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(err)
}
export default defaultErrorHandler

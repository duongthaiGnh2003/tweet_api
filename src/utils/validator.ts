import express from 'express'
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpstatus'
import { EntityErrors, ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    // nếu không có lỗi thì tiếp tục xử lý
    if (errors.isEmpty()) {
      return next()
    }
    // có lỗi thì tạo một đối tượng   và trả về lỗi
    const errorObject = errors.mapped()
    const EntityError = new EntityErrors({
      errors: {}
    })

    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      EntityError.errors[key] = errorObject[key]
    }

    next(EntityError)
  }
}

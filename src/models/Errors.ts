import HTTP_STATUS from '~/constants/httpstatus'
import { USER_MESSAGE } from '~/constants/message'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityErrors extends ErrorWithStatus {
  errors: ErrorType

  constructor({ message = USER_MESSAGE.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })

    this.errors = errors
  }
}

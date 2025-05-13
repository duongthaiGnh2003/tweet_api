import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { values } from 'lodash'
import HTTP_STATUS from '~/constants/httpstatus'
import { USER_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { hasPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validator'

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: { errorMessage: USER_MESSAGE.NAME_IS_REQUIRED },
        isString: { errorMessage: USER_MESSAGE.NAME_MUST_BE_STRING },
        isLength: {
          options: {
            min: 1,
            max: 100
          }
        },
        trim: true,
        errorMessage: USER_MESSAGE.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100
      },
      email: {
        notEmpty: { errorMessage: USER_MESSAGE.EMAIL_IS_REQUIRED },
        isEmail: true,
        trim: true,
        errorMessage: 'Email must be a valid email address',
        custom: {
          options: (value) => {
            return databaseService.users.findOne({ email: value }).then((user) => {
              if (user) {
                throw new Error(USER_MESSAGE.EMAIL_ALREADY_EXISTS)
              }
            })
          }
        }
      },
      password: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 7,
            max: 50
          }
        }
      },
      confirm_password: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 7,
            max: 50
          }
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password')
            }
            return true
          }
        }
      },
      day_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  ) //chỉ check body không check query hay params
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: { errorMessage: USER_MESSAGE.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value, password: hasPassword(req.body.password) })
            if (!user) {
              throw new Error('email or password is incorrect')
            }
            req.user = user // sau khi kiem tra xong thi gan user vao req.user de dung chong controller
            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED },
        isString: true,
        isLength: {
          options: {
            min: 7,
            max: 50
          }
        }
      }
    },
    ['body']
  ) //chỉ check body không check query hay params
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: 'Authorization header is required' },
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.split(' ')[1] // Authorization: Bear
            if (!accessToken) {
              throw new ErrorWithStatus({ message: 'Access token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }

            try {
              const decoded_authorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decoded_authorization = decoded_authorization
            } catch (err) {
              throw new ErrorWithStatus({
                message: (err as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: 'Refresh token is required' },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              const refresh_token = await databaseService.refreshTokens.findOne({ token: value })

              if (!refresh_token) {
                throw new ErrorWithStatus({ message: 'refresh token does not exist', status: HTTP_STATUS.UNAUTHORIZED })
              }
              req.decoded_refresh_token = decoded_refresh_token
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({ message: err.message, status: HTTP_STATUS.UNAUTHORIZED })
              }
              throw err
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({ message: 'Email verify token is required', status: HTTP_STATUS.UNAUTHORIZED })
          }

          const decoded_email_verify_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
          })

          req.decoded_email_verify_token = decoded_email_verify_token
          return true
        }
      }
    }
  })
)

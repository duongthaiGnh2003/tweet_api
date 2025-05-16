import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpstatus'
import { USER_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import { hasPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validator'

// regex for username not start with number, only contain a-zA-Z0-9_ and length between 4 and 15
export const REGEX_USERNAME = /^(?![0-9]+$)[A-Za-z0-9_]{4,15}$/

const passwordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 7,
      max: 50
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
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
}
const forgotPasswordTokenSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'Forgot password token is required',
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }

      try {
        const decoded_forgot_password_verify_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })

        const user = await databaseService.users.findOne({
          _id: new ObjectId(decoded_forgot_password_verify_token.userId)
        })

        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGE.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: 'Forgot password token is invalid',
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_verify_token = decoded_forgot_password_verify_token
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

const nameSchema: ParamSchema = {
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
}
const dayOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const imgSchema: ParamSchema = {
  isString: { errorMessage: 'img must be a string' },
  optional: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: 'img length must be between 1 and 400 characters'
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
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
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      day_of_birth: dayOfBirthSchema
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

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      isEmail: { errorMessage: USER_MESSAGE.EMAIL_IS_INVALID },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (!user) {
            throw new ErrorWithStatus({
              message: USER_MESSAGE.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.user = user
          return true
        }
      }
    }
  })
)

export const forgotPasswordVerifyValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload

  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: 'user is not verified',
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },

      date_of_birth: {
        ...dayOfBirthSchema,
        optional: true
      },
      bio: {
        isString: { errorMessage: 'Bio must be a string' },
        optional: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Bio length must be between 1 and 200 characters'
        }
      },
      website: {
        isString: { errorMessage: 'Website must be a string' },
        optional: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Website length must be between 1 and 200 characters'
        }
      },
      location: {
        isString: { errorMessage: 'Location must be a string' },
        optional: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Location length must be between 1 and 200 characters'
        }
      },
      username: {
        isString: { errorMessage: 'Username must be a string' },
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(
                'Username must be between 4 and 15 characters and can only contain letters, numbers, and underscores'
              )
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw new Error('Username already exists')
            }
          }
        }
      },
      avatar: imgSchema,
      cover_photo: imgSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: passwordSchema,
    password: passwordSchema, // new password
    confirm_new_password: confirmPasswordSchema
  })
)

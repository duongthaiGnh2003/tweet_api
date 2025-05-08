import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { USER_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validator'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  console.log(email, password)
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
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
  })
)

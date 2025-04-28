import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
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
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true,
      errorMessage: 'Name must be a string and between 1 and 100 characters long'
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      errorMessage: 'Email must be a valid email address',
      custom: {
        options: (value) => {
          return databaseService.users.findOne({ email: value }).then((user) => {
            if (user) {
              return Promise.reject('Email already in use')
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

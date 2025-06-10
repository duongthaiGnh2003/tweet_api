import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validator'

export const tweetIdValidator = validate(
  checkSchema({
    tweet_id: {
      isString: true,
      custom: {
        options: async (value, { req }) => {
          const tweet = await databaseService.tweets.findOne({
            _id: new ObjectId(value)
          })
          console.log('FFF', tweet)
          if (!tweet) {
            throw new ErrorWithStatus({ status: 404, message: 'Tweet is not found' })
          }
          return true
        }
      }
    }
  })
)

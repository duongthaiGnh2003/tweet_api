import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validator'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidation = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: 'type is not valid'
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: 'audience is not valid'
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType

          // If `type` is Retweet, Comment, or QuoteTweet,
          // then `parent_id` must be a valid ObjectId.
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error('parent_id must be a valid tweet id')
          }

          // If `type` is Tweet, then `parent_id` must be null.
          if (type === TweetType.Tweet && value !== null) {
            throw new Error('parent_id must be null')
          }
          return true
        }
      }
    },

    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]

          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error('content must not be empty')
          }

          if (type === TweetType.Retweet && value !== '') {
            throw new Error('content must be empty ')
          }
          return true
        }
      }
    },

    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là string
          // → Requires each element in the array to be a string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error('hashtags must be an array of strings')
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error('mentions must be an array of user_id')
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là Media Object
          // → Requires each item in the array to be a Media Object

          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error('medias must be an array of media objects')
          }
          return true
        }
      }
    }
  })
)

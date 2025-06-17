import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpstatus'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import { Tweet } from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { wrapRequestHandler } from '~/utils/handelers'
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
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: true,
        custom: {
          options: async (value, { req }) => {
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$mentions._id',
                          name: '$mentions.name',
                          username: '$mentions.username',
                          email: '$mentions.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_childrents'
                  }
                },
                {
                  $addFields: {
                    bookmarks: { $size: '$bookmarks' },
                    likes: { $size: '$likes' },
                    retweet_counts: {
                      $size: {
                        $filter: {
                          input: '$tweet_childrents',
                          as: 'item',
                          cond: { $eq: ['$$item.type', TweetType.Retweet] }
                        }
                      }
                    },
                    comment_counts: {
                      $size: {
                        $filter: {
                          input: '$tweet_childrents',
                          as: 'item',
                          cond: { $eq: ['$$item.type', TweetType.Comment] }
                        }
                      }
                    },
                    quote_counts: {
                      $size: {
                        $filter: {
                          input: '$tweet_childrents',
                          as: 'item',
                          cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                        }
                      }
                    }
                  }
                },
                { $project: { tweet_childrents: 0 } }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({ status: 404, message: 'Tweet is not found' })
            }
            ;(req as Request).tweet = tweet //gan tweet vào req để sử dụng sau này
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet

  if (tweet?.audience === TweetAudience.TwiterCircle) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: 'Unauthorized' })
    }

    const author = await databaseService.users.findOne({ _id: new ObjectId(tweet.user_id) })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: 'Author not found' })
    }

    // kiem tra xem người dùng có trong twitter circle của tác giả không
    const { userId } = req.decoded_authorization as TokenPayload
    const isInTwitterCircle = author.twitter_circle?.some((user_circle_id) => user_circle_id.equals(userId))
    if (!isInTwitterCircle && !author._id.equals(userId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: 'tweet is not public'
      })
    }
  }
  next()
})

export const getChildrenValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: true,
        custom: {
          options: async (value, { req }) => {
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
            if (!tweet) {
              throw new ErrorWithStatus({ status: 404, message: 'Tweet not found' })
            }
            return true
          }
        }
      },
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: 'tweet_type is not valid'
        }
      }
    },
    ['query', 'params']
  )
)

export const panigationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (values, { req }) => {
            const num = Number(values)
            if (num > 100) {
              throw new Error('maximum is 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true
      }
    },
    ['query']
  )
)

import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import { Tweet } from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { has } from 'lodash'

class TweetService {
  async checkendCreateHashtags(hashtags: string[]) {
    const hashtagsDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagsDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)?._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkendCreateHashtags(body.hashtags)

    await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    return body
  }

  async increaseView(tweet_id: string, user_id: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )

    return result
  }
}

const tweetService = new TweetService()
export default tweetService

import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Likes from '~/models/schemas/likes.schema'

class LikesService {
  async likeTweetService(userId: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(userId),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Likes({
          user_id: new ObjectId(userId),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }
  async unLikeTweetService(userId: string, tweet_id: string) {
    await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(userId),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const likesService = new LikesService()
export default likesService

import Bookmarks from '~/models/schemas/Bookmarks.schema'
import databaseService from './database.services'
import { ObjectId, ReturnDocument } from 'mongodb'

class BookmarksServices {
  async bookmarkTweetService(user_id: string, tweet_id: string) {
    console.log(user_id, 'hhhh')
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        // Nếu document không tồn tại → insert mới với giá trị được cung cấp.
        $setOnInsert: new Bookmarks({
          user_id: new ObjectId(user_id),
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
  async unBookmarkTweetService(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })

    return result
  }
}

const bookmarksServices = new BookmarksServices()
export default bookmarksServices

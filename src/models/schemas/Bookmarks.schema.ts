import { ObjectId } from 'mongodb'

interface bookmarksType {
  id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}

export default class Bookmarks {
  id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date

  constructor(bookmark: bookmarksType) {
    this.id = bookmark.id || new ObjectId()
    this.user_id = bookmark.user_id
    this.tweet_id = bookmark.tweet_id
    this.created_at = bookmark.created_at || new Date()
  }
}

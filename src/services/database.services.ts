import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { User } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmarks from '~/models/schemas/Bookmarks.schema'
import Likes from '~/models/schemas/likes.schema'

dotenv.config()

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(process.env.MAIN_DB_URL as string)
    this.db = this.client.db('hocnode')
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })

      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      // await this.client.close()
    }
  }
  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 }) // index db để có thể tìm kiếm nhanh hơn tăng hiệu xuất sử lý
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshToken() {
    const exists = await this.users.indexExists(['exp_1', 'token_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      ) // khi  mà cái exp này hết hạn thì cái mongo sẽ tự xóa nó khỏi database
    }
  }
  async indexVideoStatus() {
    const exists = await this.users.indexExists(['namne_1'])

    if (!exists) {
      this.videoStatus.createIndex({ namne: 1 })
    }
  }
  async indexFollowers() {
    const exists = await this.users.indexExists(['user_id_1_follower_user_id_1'])

    if (!exists) {
      this.followers.createIndex({ user_id: 1, follower_user_id: 1 })
    }
  }

  async indexTweets() {
    const exists = await this.users.indexExists(['content_text'])

    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refreshTokens')
  }
  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection('videoStatus')
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection('tweets')
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection('hashtags')
  }
  get bookmarks(): Collection<Bookmarks> {
    return this.db.collection('bookmarks')
  }
  get likes(): Collection<Likes> {
    return this.db.collection('likes')
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

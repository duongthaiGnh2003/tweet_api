import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { User } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

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
  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 }) // index db để có thể tìm kiếm nhanh hơn tăng hiệu xuất sử lý
    this.users.createIndex({ email: 1 }, { unique: true })
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
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

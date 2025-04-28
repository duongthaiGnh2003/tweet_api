import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { User } from '~/models/schemas/User.schema'

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

  get users(): Collection<User> {
    return this.db.collection('users')
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

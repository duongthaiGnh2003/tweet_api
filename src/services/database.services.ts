import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()
console.log(process.env.MAIN_DB_URL)
class DatabaseService {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(process.env.MAIN_DB_URL as string)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

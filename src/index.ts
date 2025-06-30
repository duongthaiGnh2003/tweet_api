import express from 'express'
import multer from 'multer'

import databaseService from './services/database.services'
import defaultErrorHandler from './middlewares/error.middlewares'
import { mediasRouter } from './routes/media.routes'
import { config } from 'dotenv'
import { staticRouter } from './routes/static.routes'
import cors from 'cors'
import usersRouter from './routes/users.routes'
import tweetRouter from './routes/tweet.routes'
import bookmarksRoutes from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/cloudinary'

config() // đọc file .env

const port = process.env.PORT || 4000 // day la

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshToken()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
}) // kết nối database
const app = express()
const upload = multer()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(upload.any()) // đọc body req khi dùng form-data

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tweet', tweetRouter)
app.use('/bookmarks', bookmarksRoutes)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)

// err handler middleware sử dụng để bắt lỗi từ các middleware khác
app.use(defaultErrorHandler as express.ErrorRequestHandler)

app.listen(port, () => {
  console.log('dang chay tren cong : ' + port)
})

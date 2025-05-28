import express from 'express'
import multer from 'multer'
import usersRouter from './routes/users.router'
import databaseService from './services/database.services'
import defaultErrorHandler from './middlewares/error.middlewares'
import { mediasRouter } from './routes/media.route'
import { config } from 'dotenv'
import { staticRouter } from './routes/static.routers'

config() // đọc file .env

const port = process.env.PORT || 4000 // day la

databaseService.connect() // kết nối database
const app = express()
const upload = multer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(upload.any()) // đọc body req khi dùng form-data

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)

// err handler middleware sử dụng để bắt lỗi từ các middleware khác
app.use(defaultErrorHandler as express.ErrorRequestHandler)

app.listen(port, () => {
  console.log('dang chay tren cong : ' + port)
})

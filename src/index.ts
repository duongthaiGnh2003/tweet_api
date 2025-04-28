import express from 'express'
import multer from 'multer'
import usersRouter from './routes/users.router'
import databaseService from './services/database.services'
const port = 4000
const app = express()
const upload = multer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(upload.none()) // đọc body req khi dùng form-data
databaseService.connect()
app.get('/', (req, res) => {
  res.send('helo')
})

app.use('/user', usersRouter)

app.listen(port, () => {
  console.log('dang chay tren cong : ' + port)
})

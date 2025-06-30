import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_app_password' // KHÔNG dùng mật khẩu thường
  }
})

const mailOptions = {
  from: 'your_email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  html: '<h1>Hello from Node!</h1>'
}

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Email sent:', info.response)
  }
})

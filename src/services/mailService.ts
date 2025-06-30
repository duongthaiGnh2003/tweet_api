import nodemailer from 'nodemailer'
import ejs, { name } from 'ejs'

import path from 'path'
import { fs } from 'zx'

// Khởi tạo transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // email bạn
    pass: process.env.MAIL_PASS // app password
  }
})

class MailService {
  async sendEmailToVerifyEmail({
    to,
    subject,
    htmlFile,
    data
  }: {
    to: string
    subject: string
    htmlFile: string
    data: { name?: string; verifyLink: string }
  }) {
    const pathFile = path.resolve('src/models/templates/' + htmlFile)
    const template = fs.readFileSync(pathFile, 'utf8')
    const htmlContent = ejs.render(template, data)

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
  }
}

const mailService = new MailService()
export default mailService

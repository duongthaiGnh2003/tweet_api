import crypto from 'crypto'
import { env } from 'process'

export function sha256(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export function hasPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}

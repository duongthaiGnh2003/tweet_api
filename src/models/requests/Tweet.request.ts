import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'
import { Query } from 'express-serve-static-core'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // ID của tweet cha (nếu là reply)
  hashtags: string[] // tên cụm từ khóa
  mentions: string[] // user_id được nhắc đến
  medias: Media[]
}

export interface tweetQuery extends Query {
  tweet_type: string
  limit?: string
  page?: string
}

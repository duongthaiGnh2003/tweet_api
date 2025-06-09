import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.request'

export const createTweetController = (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  res.send('dfgdflkgjdkl')
}

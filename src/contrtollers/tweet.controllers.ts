import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetService from '~/services/tweet.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload

  const result = await tweetService.createTweet(userId, req.body)

  res.json({
    message: 'Tweet created successfully',
    data: result
  })
}

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await tweetService.increaseView(req.params.tweet_id, userId)
  const tweet = {
    ...req.tweet,
    guest_views: result?.guest_views,
    user_views: result?.user_views
  }
  console.log('GGGGGGGGG', tweet)
  res.json({
    message: 'Tweet created successfully',
    data: tweet
  })
}

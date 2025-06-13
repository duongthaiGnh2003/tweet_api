import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { update } from 'lodash'
import { tweetQuery, TweetRequestBody } from '~/models/requests/Tweet.request'
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
    user_views: result?.user_views,
    updated_at: result?.updated_at
  }

  res.json({
    message: 'Tweet created successfully',
    data: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, any, tweetQuery>,
  res: Response
) => {
  const { userId } = req.decoded_authorization as TokenPayload

  const result = await tweetService.getTweetChildrenservice({
    user_id: userId,
    tweet_id: req.params.tweet_id,
    tweet_type: Number(req.query.tweet_type),
    limit: Number(req.query.limit),
    page: Number(req.query.page)
  })

  res.json({
    message: 'Tweet created successfully',
    data: result
  })
}

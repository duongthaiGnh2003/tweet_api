import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { likeTweetRequestBody } from '~/models/requests/likes.request'

export const LikeController = async (req: Request<ParamsDictionary, any, likeTweetRequestBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await likesService.likeTweetService(userId, req.body.tweet_id)
  res.json({
    message: 'Like tweet successfully',
    data: result
  })
}
export const unLikeController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  await likesService.unLikeTweetService(userId, req.params.tweet_id)
  res.json({
    message: 'Unlike tweet successfully'
  })
}

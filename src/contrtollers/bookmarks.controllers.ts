import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkRequestBody } from '~/models/requests/bookmarks.request'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksServices from '~/services/bookmarks.services'

export const bookmarksTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response
) => {
  const { userId } = req.decoded_authorization as TokenPayload

  const result = await bookmarksServices.bookmarkTweetService(userId, req.body.tweet_id)
  res.json({
    message: 'Tweet bookmarked successfully',
    data: result
  })
}

export const unBookmarksTweetController = async (req: Request, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await bookmarksServices.unBookmarkTweetService(userId, req.params.tweet_id)
  res.json({
    message: 'Tweet unbookmarked successfully',
    data: result
  })
}

import { Router } from 'express'
import { access } from 'fs'
import { bookmarksTweetController, unBookmarksTweetController } from '~/contrtollers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'

import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const bookmarksRouter = Router()

bookmarksRouter.post('/', accessTokenValidator, wrapRequestHandler(bookmarksTweetController))
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarksTweetController)
)
export default bookmarksRouter

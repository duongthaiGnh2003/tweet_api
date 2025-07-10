import { Router } from 'express'
import { access } from 'fs'
import { bookmarksTweetController, unBookmarksTweetController } from '~/contrtollers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'

import { accessTokenCookieValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const bookmarksRouter = Router()

bookmarksRouter.post('/', accessTokenCookieValidator, wrapRequestHandler(bookmarksTweetController))
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenCookieValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarksTweetController)
)
export default bookmarksRouter

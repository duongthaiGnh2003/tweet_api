import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/contrtollers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidation,
  getChildrenValidator,
  panigationValidator,
  tweetIdValidator
} from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const tweetRouter = Router()

tweetRouter.post('/', accessTokenValidator, createTweetValidation, wrapRequestHandler(createTweetController))

tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

tweetRouter.get(
  '/:tweet_id/children',
  getChildrenValidator,
  panigationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

// lấy ra những bài viết của những người mà mình đã follwer
tweetRouter.get(
  '/', //new-feeds
  panigationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNewFeedsController)
)
export default tweetRouter

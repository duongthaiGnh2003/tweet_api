import { Router } from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/contrtollers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidation,
  getChildrenValidator,
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
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)
export default tweetRouter

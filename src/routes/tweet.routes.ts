import { Router } from 'express'
import { createTweetController, getTweetController } from '~/contrtollers/tweet.controllers'
import { audienceValidator, createTweetValidation, tweetIdValidator } from '~/middlewares/tweet.middlewares'
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
export default tweetRouter

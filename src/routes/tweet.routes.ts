import { Router } from 'express'
import { createTweetController } from '~/contrtollers/tweet.controllers'
import { createTweetValidation, tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const tweetRouter = Router()

tweetRouter.post('/', accessTokenValidator, createTweetValidation, wrapRequestHandler(createTweetController))
tweetRouter.get('/:tweet_id', tweetIdValidator, wrapRequestHandler(createTweetController))
export default tweetRouter

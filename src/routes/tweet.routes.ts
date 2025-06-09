import { Router } from 'express'
import { createTweetController } from '~/contrtollers/tweet.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const tweetRouter = Router()

tweetRouter.post('/', wrapRequestHandler(createTweetController))

export default tweetRouter

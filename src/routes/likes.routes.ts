import { Router } from 'express'
import { LikeController, unLikeController } from '~/contrtollers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenCookieValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const likesRouter = Router()
likesRouter.post('/', accessTokenCookieValidator, tweetIdValidator, wrapRequestHandler(LikeController))
likesRouter.delete('/tweet/:tweet_id', accessTokenCookieValidator, wrapRequestHandler(unLikeController))
export default likesRouter

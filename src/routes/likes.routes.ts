import { Router } from 'express'
import { LikeController, unLikeController } from '~/contrtollers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const likesRouter = Router()
likesRouter.post('/', accessTokenValidator, tweetIdValidator, wrapRequestHandler(LikeController))
likesRouter.delete('/tweet/:tweet_id', accessTokenValidator, wrapRequestHandler(unLikeController))
export default likesRouter

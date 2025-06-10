import { Router } from 'express'
import { LikeController, unLikeController } from '~/contrtollers/likes.controllers'
import { likeValidator } from '~/middlewares/likes.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const likesRouter = Router()
likesRouter.post('/', accessTokenValidator, likeValidator, wrapRequestHandler(LikeController))
likesRouter.delete('/tweet/:tweet_id', accessTokenValidator, wrapRequestHandler(unLikeController))
export default likesRouter

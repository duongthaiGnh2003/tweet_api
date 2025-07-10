import { Router } from 'express'
import { searchController } from '~/contrtollers/search.controllers'
import { searchValidation } from '~/middlewares/search.middlewares'
import { accessTokenCookieValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const searchRouter = Router()
searchRouter.get('/', searchValidation, accessTokenCookieValidator, wrapRequestHandler(searchController))

export default searchRouter

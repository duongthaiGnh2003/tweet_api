import { Router } from 'express'
import { searchController } from '~/contrtollers/search.controllers'
import { searchValidation } from '~/middlewares/search.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handelers'

const searchRouter = Router()
searchRouter.get('/', searchValidation, accessTokenValidator, wrapRequestHandler(searchController))

export default searchRouter

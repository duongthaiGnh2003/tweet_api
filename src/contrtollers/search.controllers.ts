import { Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/search.request'
import { ParamsDictionary } from 'express-serve-static-core'
import searchService from '~/services/search.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { PeopleFollow } from '~/constants/enums'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await searchService.searchService({
    user_id: userId,
    limit,
    page,
    content: req.query.content,
    media_type: req.query.media_type,
    people_follow: req.query.people_follow
  })
  res.json({
    message: 'Search successfully',
    data: result
  })
}

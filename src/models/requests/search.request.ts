import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { Pagination } from './Tweet.request'

export interface SearchQuery extends Pagination {
  content: string
  media_type: MediaTypeQuery
  people_follow?: PeopleFollow
}

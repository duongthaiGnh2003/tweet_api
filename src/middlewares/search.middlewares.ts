import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { validate } from '~/utils/validator'

export const searchValidation = validate(
  checkSchema(
    {
      content: { isString: { errorMessage: 'Content must be string' } },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        }
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)],
          errorMessage: 'people follow must be 0 or 1'
        }
      }
    },
    ['query']
  )
)

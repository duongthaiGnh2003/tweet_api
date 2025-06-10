import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validator'

export const likeValidator = validate(
  checkSchema({
    tweet_id: {
      isString: true
    }
  })
)

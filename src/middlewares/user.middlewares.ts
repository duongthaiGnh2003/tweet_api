import { NextFunction, Request, Response } from 'express'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  console.log(email, password)
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}

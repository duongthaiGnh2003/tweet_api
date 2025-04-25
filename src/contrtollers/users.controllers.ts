import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email && password) {
    res.json({
      message: 'Login success'
    })
  }

  res.status(400).json({
    error: 'Login failed'
  })
}

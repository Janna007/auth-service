import { Request, Response } from 'express'

export const registerUser = (req: Request, res: Response) => {
    res.status(201).json()
}

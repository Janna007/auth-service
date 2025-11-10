import { NextFunction, Request, Response } from 'express'
import { AuthUser } from '../types'
import createHttpError from 'http-errors'

export default function canAccess(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthUser
        const role = _req.auth.role

        if (!roles.includes(role)) {
            const error = createHttpError(403, 'permission Denied!!')
            next(error)
            return
        }

        next()
    }
}

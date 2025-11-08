import { expressjwt } from 'express-jwt'
import { Config } from '../config'
import { Request } from 'express'
import { AuthCookie, IRefreshToken } from '../types'
import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import { Jwt } from 'jsonwebtoken'
import logger from '../config/logger'

console.log('Config.REFRESH_TOKEN_SECRET', Config.REFRESH_TOKEN_SECRET)

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refresh_token } = req.cookies as AuthCookie
        return refresh_token
    },

    async isRevoked(req: Request, token: Jwt | undefined): Promise<boolean> {
        try {
            const refreshRepo = AppDataSource.getRepository(RefreshToken)

            const refreshToken = await refreshRepo.find({
                where: {
                    id: Number((token?.payload as IRefreshToken).id),
                    user: { id: Number(token?.payload.sub) },
                },
            })
            return refreshToken.length === 0
        } catch {
            logger.error('error while getting refresh token', {
                id: (token?.payload as IRefreshToken).id,
            })
            return true
        }
    },
})

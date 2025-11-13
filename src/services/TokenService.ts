import { JwtPayload, sign } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Config } from '../config'
import { Repository } from 'typeorm'
import { RefreshToken } from '../entity/RefreshToken'
import { userResponse } from '../types'

export class TokenService {
    constructor(private tokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string

        if (!Config.PRIVATE_KEY) {
            const err = createHttpError(500, 'error while reading private key')
            throw err
        }
        try {
            // privateKey = fs.readFileSync(
            //     path.join(__dirname, '../../certs/private.pem'),
            // )
            privateKey = Config.PRIVATE_KEY
        } catch {
            const err = createHttpError(500, 'error while reading private key')

            throw err
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1hr',
            issuer: 'auth-service',
        })

        return accessToken
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        })

        return refreshToken
    }

    async createRefreshToken(userCreated: userResponse) {
        try {
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365 //1 year
            const newRefreshToken = await this.tokenRepository.save({
                user: userCreated,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            })

            return newRefreshToken
        } catch {
            const error = createHttpError(
                500,
                'Error while saving refreshToken to the database',
            )
            throw error
        }
    }

    async deleteRefreshToken(tokenId: number) {
        try {
            const tokenToRemove = await this.tokenRepository.find({
                where: { id: tokenId },
            })
            const removed = this.tokenRepository.remove(tokenToRemove)
            return removed
        } catch {
            const error = createHttpError(
                500,
                'Error while removing refreshToken from the database',
            )
            throw error
        }
    }
}

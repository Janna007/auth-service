import { expressjwt, GetVerificationKey } from 'express-jwt'
import JwksClient from 'jwks-rsa'
import { Config } from '../config'
import { Request } from 'express'
import { AuthCookie } from '../types'

// console.log('JWKS_URI in middleware:', Config.JWKS_URI)

export default expressjwt({
    secret: JwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,

    algorithms: ['RS256'],
    getToken(req: Request) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.split(' ')[1] !== undefined) {
            const token = authHeader.split(' ')[1]

            if (token) {
                return token
            }
        }
        // console.log("req.cookies",req.cookies)
        const { access_token } = req.cookies as AuthCookie

        // console.log("access_token",access_token)

        return access_token
    },
})

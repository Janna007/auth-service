import fs from 'fs'
import { NextFunction, Response } from 'express'
import { RequestRegisterUser } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import path from 'path'
import createHttpError from 'http-errors'
import { Config } from '../config'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService
    }
    async userRegister(
        req: RequestRegisterUser,
        res: Response,
        next: NextFunction,
    ) {
        //field validation
        const result = validationResult(req)
        // console.log("validation result",result)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { firstName, lastName, email, password } = req.body

        this.logger.debug('data recieved from request body', {
            firstName,
            lastName,
            email,
            password: '****',
        })
        try {
            const userCreated = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
            })
            // console.log("user created:",userCreated)
            this.logger.info('user registered successfully', {
                id: userCreated.id,
            })

            //create tokens
            let privateKey: Buffer
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                )
            } catch {
                const err = createHttpError(
                    500,
                    'error while reading private key',
                )
                next(err)
                return
            }

            const payload: JwtPayload = {
                sub: String(userCreated.id),
                role: userCreated.role,
            }

            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1hr',
                issuer: 'auth-service',
            })

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            })

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1 hour
            })

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
            })

            res.status(201).json({ id: userCreated.id })
        } catch (error) {
            next(error)
            return
        }
    }
}

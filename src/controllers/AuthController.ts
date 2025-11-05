import { NextFunction, Response } from 'express'
import { RequestRegisterUser } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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

            //create access token

            const payload: JwtPayload = {
                sub: String(userCreated.id),
                role: userCreated.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)
            // create refreshtoken
            // console.log("newRefreshToken",newRefreshToken)
            const newRefreshToken =
                await this.tokenService.createRefreshToken(userCreated)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            })

            //responses

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

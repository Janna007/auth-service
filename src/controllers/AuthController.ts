import { NextFunction, Response } from 'express'
import { AuthUser, RequestLoginUser, RequestRegisterUser } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import { CredentialService } from '../services/CredentialService'
import createHttpError from 'http-errors'
import { roles } from '../constants'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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
                role: roles.CUSTOMER,
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

    async loginUser(req: RequestLoginUser, res: Response, next: NextFunction) {
        //field validation
        const result = validationResult(req)
        // console.log("validation result",result)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { email, password } = req.body

        this.logger.debug('data recieved from request body', {
            email,
            password: '****',
        })
        try {
            //email verify

            const user = await this.credentialService.findUserByEmail(email)

            if (!user) {
                const err = createHttpError(
                    400,
                    'Incorrect Email or Password!!Please try again with another email or password',
                )
                next(err)
                return
            }

            //verify password

            const matchedPassword = await this.credentialService.verifyPassword(
                password,
                user.password,
            )

            if (!matchedPassword) {
                const err = createHttpError(
                    400,
                    'Incorrect Email or Password!!Please try again with another email or password',
                )
                next(err)
                return
            }

            //create access token

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)
            // create refreshtoken
            // console.log("newRefreshToken",newRefreshToken)
            const newRefreshToken =
                await this.tokenService.createRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            })

            //  //responses

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

            this.logger.info('logged in succesfully', { id: user.id })

            res.json({ id: user.id })
        } catch (error) {
            next(error)
            return
        }
    }

    async getUser(req: AuthUser, res: Response, next: NextFunction) {
        try {
            console.log(req.auth)
            const user = await this.userService.findUserById(
                Number(req.auth.sub),
            )
            console.log(user)
            res.json(user)
        } catch (error) {
            next(error)
            return
        }
    }

    async refresh(req: AuthUser, res: Response, next: NextFunction) {
        //user id is required
        const userId = req.auth.sub

        const user = await this.userService.findUserById(Number(userId))

        if (!user) {
            const err = createHttpError(401, 'User with this id is not found')
            next(err)
            return
        }

        //new access token generation
        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        }

        const accessToken = this.tokenService.generateAccessToken(payload)

        //new refresh token generation

        const newRefreshToken = await this.tokenService.createRefreshToken(user)

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: newRefreshToken.id,
        })

        //delete  old refresh from db
        const tokenRemoved = await this.tokenService.deleteRefreshToken(
            Number(req.auth.id),
        )
        this.logger.info('token removed', { tokenRemoved: tokenRemoved })
        //send to user

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

        this.logger.info('token refreshed succesfully', { id: user.id })
        res.json({ id: user.id })
    }

    async logout(req: AuthUser, res: Response, next: NextFunction) {
        try {
            //require token id and remove from db
            const tokenId = req.auth.id
            const tokenRemoved = await this.tokenService.deleteRefreshToken(
                Number(tokenId),
            )
            this.logger.info('token removed', { tokenRemoved: tokenRemoved })

            //clear cookies
            res.clearCookie('access_token')
            res.clearCookie('refresh_token')

            res.json({ message: 'succesfully logged out' })
        } catch (error) {
            next(error)
            return
        }
    }
}

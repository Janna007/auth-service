import { NextFunction, Response } from 'express'
import { RequestRegisterUser } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'

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
            res.status(201).json({ id: userCreated.id })
        } catch (error) {
            next(error)
            return
        }
    }
}

import { Response } from 'express'
import { RequestRegisterUser } from '../types'
import { UserService } from '../services/UserService'

export class AuthController {
    userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }
    async userRegister(req: RequestRegisterUser, res: Response) {
        const { firstName, lastName, email, password } = req.body
        const userCreated = await this.userService.createUser({
            firstName,
            lastName,
            email,
            password,
        })
        // console.log("user created:",userCreated)
        res.status(201).json({ id: userCreated.id })
    }
}

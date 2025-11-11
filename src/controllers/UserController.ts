import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { UserCreateRequest } from '../types'
import { roles } from '../constants'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'

export class UserController {
    constructor(private userService: UserService) {}
    async create(req: UserCreateRequest, res: Response, next: NextFunction) {
        try {
            //validation

            const result = validationResult(req)

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() })
            }

            const { firstName, lastName, email, password } = req.body
            // const tenantId=req.params.id

            const userCreated = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
                role: roles.MANAGER,
            })

            res.status(201).json({ id: userCreated.id })
        } catch (error) {
            next(error)
        }
    }

    async update(req: UserCreateRequest, res: Response, next: NextFunction) {
        try {
            //validation

            const result = validationResult(req)

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() })
            }

            const userId = req.params.id

            if (!userId) {
                const error = createHttpError(400, 'user id is invalid')
                next(error)
                return
            }

            const { firstName, lastName, email, password } = req.body

            await this.userService.updateUser(
                {
                    firstName,
                    lastName,
                    email,
                    password,
                    role: roles.MANAGER,
                },
                Number(userId),
            )

            res.status(201).json({ id: userId })
        } catch (error) {
            next(error)
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            //  console.log(req.query)
            //add query validation using express validator
            //todo add searching function

            const page = req.query.page || 1
            const perPage = req.query.perPage || 200
            //  let role=req.query.role || ""

            const users = await this.userService.getUsers(
                Number(page),
                Number(perPage),
            )
            //  console.log("users",users)
            res.json(users)
        } catch (error) {
            next(error)
        }
    }

    async getOneUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findUserById(
                Number(req.params.id),
            )
            console.log(user)
            res.json(user)
        } catch (error) {
            next(error)
            return
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.deleteUSer(
                Number(req.params.id),
            )
            console.log(user)
            res.json(user)
        } catch (error) {
            next(error)
            return
        }
    }
}

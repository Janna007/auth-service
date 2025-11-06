import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { roles } from '../constants'
import bcrypt from 'bcrypt'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async createUser({ firstName, lastName, email, password }: UserData) {
        const userExist = await this.userRepository.findOne({
            where: { email: email },
        })
        if (userExist) {
            const error = createHttpError(400, 'Email Alreday Exist')
            throw error
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: roles.CUSTOMER,
            })
        } catch {
            const error = createHttpError(
                500,
                'Error while saving data to the database',
            )
            throw error
        }
    }

    async findUserById(id: number) {
        try {
            return await this.userRepository.findOne({ where: { id } })
        } catch {
            const err = createHttpError(
                500,
                'unable to find user ,server error',
            )
            throw err
        }
    }
}

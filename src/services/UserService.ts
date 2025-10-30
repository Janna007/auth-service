import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { roles } from '../constants'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async createUser({ firstName, lastName, email, password }: UserData) {
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
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
}

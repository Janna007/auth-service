import { Repository } from 'typeorm'
import { User } from '../entity/User'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'

export class CredentialService {
    constructor(private userRepository: Repository<User>) {}
    async findUserByEmail(email: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                select: ['password', 'id', 'email', 'role'],
            })

            console.log('user in service', user)

            return user
        } catch {
            const err = createHttpError(
                500,
                'unable to find user ,server error',
            )
            throw err
        }
    }

    async verifyPassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword)
    }
}

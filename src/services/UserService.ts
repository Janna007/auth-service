import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async createUser({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
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
                role,
                tenant: tenantId ? { id: tenantId } : null,
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
            return await this.userRepository.findOne({
                where: { id },
                select: ['email', 'firstName', 'id', 'lastName', 'role'],
            })
        } catch {
            const err = createHttpError(
                500,
                'unable to find user ,server error',
            )
            throw err
        }
    }

    async getUsers(page: number, perPage: number) {
        try {
            // const users=await this.userRepository.findAndCount()

            // .where("user.role = :role", { role: role })

            const queryBuilder = this.userRepository.createQueryBuilder('user')

            //  if(role){
            //     console.log("role",role)
            //     queryBuilder.where("user.role = :role", { role: role })
            //  }

            const users = await queryBuilder
                .orderBy('user.id')
                .leftJoinAndSelect('user.tenant', 'tenant')
                .skip((page - 1) * perPage)
                .take(perPage)
                .getManyAndCount()

            return users
        } catch {
            const error = createHttpError(
                500,
                'Error while fetching users data from the database',
            )
            throw error
        }
    }

    async updateUser(
        { firstName, lastName, email, password, role, tenantId }: UserData,
        userId: number,
    ) {
        const userExist = await this.userRepository.findOne({
            where: { id: userId },
        })
        if (!userExist) {
            const error = createHttpError(400, 'User is not exist Exist')
            throw error
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : null,
            })
        } catch {
            const error = createHttpError(500, 'Error while updating data')
            throw error
        }
    }

    async deleteUSer(userId: number) {
        console.log(userId)
        try {
            return await this.userRepository.delete(userId)
        } catch {
            const err = createHttpError(
                500,
                'unable to delete user ,server error',
            )
            throw err
        }
    }
}

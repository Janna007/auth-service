'use strict'
import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { roles } from './constants'
import { User } from './entity/User'
import bcrypt from 'bcrypt'

const adminUserCreate = async () => {
    try {
        const adminEmail: string = process.env.ADMIN_EMAIL || 'admin@gmail.com'
        const adminPassword: string = process.env.ADMIN_PASSWORD || 'admin123'
        const adminFirstName: string = process.env.ADMIN_FIRST_NAME || 'janna'
        const adminLastName: string = process.env.ADMIN_LAST_NAME || 'kondeth'

        const userRepository = AppDataSource.getRepository(User)

        const user = await userRepository.findOne({
            where: { email: adminEmail },
        })
        if (user) {
            logger.info('admin with this email already created', {
                email: user.email,
            })
            return
        }
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)
        return await userRepository.save({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            password: hashedPassword,
            role: roles.ADMIN,
        })
    } catch (error) {
        console.log(error)
        return
    }
}

const startServer = async () => {
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize()
        logger.info('Database connected successfully')
        await adminUserCreate()
        app.listen(PORT, () => {
            logger.info('Server is running on port', { port: PORT })
        })
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

void startServer()
export default startServer

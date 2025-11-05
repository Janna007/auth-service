'use strict'
import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'

const startServer = async () => {
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize()
        logger.info('Database connected successfully')
        console.log(AppDataSource.entityMetadatas.map((m) => m.name))
        app.listen(PORT, () => {
            logger.info('Server is running on port', { port: PORT })
        })
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

void startServer()

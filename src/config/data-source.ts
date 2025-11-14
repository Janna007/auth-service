import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from '.'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST ?? '',
    port: Number(Config.DB_PORT ?? 5432),
    username: Config.DB_USERNAME ?? '',
    password: Config.DB_PASSWORD ?? '',
    database: Config.DB_NAME ?? '',
    ssl: { rejectUnauthorized: false },
    extra: {
        pool_mode: 'session', // Required by Neon/pgBouncer
        family: 4, // 👈 Force IPv4
    },

    //dont use in production
    synchronize: false,
    logging: false,
    entities: ['src/entity/*.{ts,js}'],
    migrations: ['src/migration/*.{ts.js}'],
    subscribers: [],
})

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
    // ✅ SSL only enabled in CI (Supabase)
    ssl: Config.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

    // ✅ Pool mode only for Supabase CI
    extra: {
        ...(Config.DB_POOL_MODE !== 'none' && {
            pool_mode: Config.DB_POOL_MODE,
        }),

        // Force IPv4 if needed
        ...(Config.DB_FAMILY && {
            family: Number(Config.DB_FAMILY),
        }),
    },
    //dont use in production
    synchronize: false,
    logging: false,
    entities: ['src/entity/*.{ts,js}'],
    migrations: ['src/migration/*.{ts.js}'],
    subscribers: [],
})

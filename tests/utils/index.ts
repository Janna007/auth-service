import { DataSource } from 'typeorm'

export const truncateTables = async (dataSource: DataSource) => {
    const entities = dataSource.entityMetadatas

    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name)
        await repository.clear()
    }
}

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false
    }
    const parts = token.split('.')

    if (parts.length !== 3) {
        return false
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8')
        })
        return true
    } catch {
        return false
    }
}

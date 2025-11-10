import request from 'supertest'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /tenants', () => {
    let dataSource: DataSource

    beforeAll(async () => {
        try {
            dataSource = await AppDataSource.initialize()
        } catch (error) {
            console.error('Database init error ❌:', error)
            throw error // stop tests if DB fails
        }
    })

    beforeEach(async () => {
        //database truncate //clean database before each test cases
        await dataSource.dropDatabase()
        await dataSource.synchronize()
    })

    afterAll(async () => {
        await dataSource.destroy()
    })

    describe('All fields are given', () => {
        it('should return a 201 status code', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            const response = await request(app)
                .post('/tenants')
                .send(tenantData)

            expect(response.status).toBe(201)
        })

        it('should store tenant data in database', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            const response = await request(app)
                .post('/tenants')
                .send(tenantData)

            const tenantRepository = dataSource.getRepository(Tenant)
            const tenants = await tenantRepository.find()

            // console.log("tenatns of 0",tenants[0])
            // console.log("tenants[0]?.id",tenants[0]?.id)
            // console.log("response.body.id",response.body.id)

            expect(tenants[0]?.name).toBe(tenantData.name)
            expect(tenants[0]?.id).toBe(
                (response.body as Record<string, string>).id,
            )
        })
    })
})

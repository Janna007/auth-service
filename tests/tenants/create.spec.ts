// process.env.JWKS_URI="http://localhost:5501/.well-known/jwks.json"

import request from 'supertest'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
import { Tenant } from '../../src/entity/Tenant'

// console.log("JWKS URI in test:", process.env.JWKS_URI)

describe('POST /tenants', () => {
    let dataSource: DataSource
    // let jwks: ReturnType<typeof createJWKSMock>;
    // let token:string

    beforeAll(async () => {
        try {
            // jwks = createJWKSMock('https://localhost:5501');
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
        // jwks.start();
    })

    // afterEach(() => {
    //     jwks.stop();
    // });

    afterAll(async () => {
        await dataSource.destroy()
    })

    describe('All fields are given', () => {
        it.skip('should return a 201 status code', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            //  token = jwks.token({
            //     sub: "1",
            //     role: roles.ADMIN
            // });

            const response = await request(app)
                .post('/tenants')
                // .set("Cookie",[`access_token=${token}`])
                .send(tenantData)

            // console.log("response",response)

            expect(response.status).toBe(201)
        })

        it.skip('should store tenant data in database', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            //  token = jwks.token({
            // sub: "1",
            // role: roles.ADMIN
            // });

            const response = await request(app)
                .post('/tenants')
                // .set("Cookie",[`access_token=${token}`])
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

        it('should return 401 if the user is not authenticated', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            const response = await request(app)
                .post('/tenants')
                .send(tenantData)

            expect(response.status).toBe(401)
        })

        it.skip('should return 403 if its is not an admin', async () => {
            const tenantData = {
                name: 'kfc',
                address: 'bangalore',
            }

            await request(app).post('/tenants').send(tenantData)
        })
    })
})

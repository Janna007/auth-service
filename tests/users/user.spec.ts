import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import request from 'supertest'
import { User } from '../../src/entity/User'
import { roles } from '../../src/constants'
// import { generateKeyPair, SignJWT } from 'jose'

describe('POST /auth/self', () => {
    let dataSource: DataSource
    // let privateKey:CryptoKey

    beforeAll(async () => {
        try {
            // const { privateKey: pk } = await generateKeyPair('RS256');
            // privateKey = pk;
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

    it('should return 200 status code', async () => {
        const response = await request(app).get('/auth/self').send()

        expect(response.status).toBe(200)
    })

    it('should return userdata in response', async () => {
        //register user

        const registeruserData = {
            firstName: 'janna',
            lastName: 'jk',
            email: 'jannakondeth6@gmail.com',
            password: 'janna123',
        }

        const userRepository = dataSource.getRepository(User)
        const userData = await userRepository.save({
            ...registeruserData,
            role: roles.CUSTOMER,
        })
        console.log(userData)

        //generate token

        // const payload = { sub: String(userData.id), role:roles.CUSTOMER};
        // const token = await new SignJWT(payload)
        //     .setProtectedHeader({ alg: 'RS256' })
        //     .setExpirationTime('1h')
        //     .sign(privateKey);

        // //send req with token

        // const response=await request(app).get('/auth/self').set('Cookie',[`access_token=${token};`])

        //check the response

        // expect((response.body as Record<string,string>).id).toBe(userData.id)
    })
})

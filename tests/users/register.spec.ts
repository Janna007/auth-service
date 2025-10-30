import request from 'supertest'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { truncateTables } from '../utils/index'

describe('POST /auth/register', () => {
    describe('Registered Succesfully with 201', () => {
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
            await truncateTables(dataSource)
        })

        afterAll(async () => {
            await dataSource.destroy()
        })

        //test case 1
        it('should return 201', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
        })

        //test case 2

        it('should return valid json response', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            )
        })

        //test case 3

        it('it should persist the user in the database', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }
            await request(app).post('/auth/register').send(userData)

            const userRepository = dataSource.getRepository(User)
            // console.log(userRepository)
            const users = await userRepository.find()
            // console.log(users)
            expect(users).toHaveLength(1)
            expect(users[0]?.firstName).toBe(userData.firstName)
            expect(users[0]?.lastName).toBe(userData.lastName)
            expect(users[0]?.email).toBe(userData.email)
        })
    })
})

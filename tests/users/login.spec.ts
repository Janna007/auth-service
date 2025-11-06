import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import request from 'supertest'

describe('POST /auth/login', () => {
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

    describe('All fields are given ', () => {
        it('should return 200 status code ', async () => {
            const registeruserData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            await request(app).post('/auth/register').send(registeruserData)

            const userData = {
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            expect(response.statusCode).toBe(200)
        })

        it('should return 400 if user with that email is not exist', async () => {
            const registeruserData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth6@gmail.com',
                password: 'janna123',
            }

            await request(app).post('/auth/register').send(registeruserData)

            const userData = {
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            expect(response.status).toBe(400)
        })

        it('should return if the password is not matching', async () => {
            const registeruserData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            await request(app).post('/auth/register').send(registeruserData)

            const userData = {
                email: 'jannakondeth5@gmail.com',
                password: 'janna1234',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            expect(response.status).toBe(400)
        })
    })

    describe('Fields are not format', () => {
        it('shoiuld return 400 if the email is not a valid email', async () => {
            const userData = {
                email: 'jannakondgmaicom',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            expect(response.status).toBe(400)
        })
    })

    describe('field are missing', () => {
        it('should return 400 if email is missing', async () => {
            const userData = {
                email: '',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)
            expect(response.status).toBe(400)
        })

        it('should return 400 if password is missing', async () => {
            const userData = {
                email: 'jannakondeth5@gmail.com',
                password: '',
            }

            const response = await request(app)
                .post('/auth/login')
                .send(userData)
            expect(response.status).toBe(400)
        })
    })
})

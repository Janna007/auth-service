import request from 'supertest'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { roles } from '../../src/constants'
import { isJwt } from '../utils'
import { RefreshToken } from '../../src/entity/RefreshToken'

describe('POST /auth/register', () => {
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

        //test case4

        it('should return the id of new created user', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            // console.log("response would be:", response)
            expect(response.body).toHaveProperty('id')
            const userRepository = dataSource.getRepository(User)
            // console.log(userRepository)
            const users = await userRepository.find()

            expect((response.body as Record<string, string>).id).toBe(
                users[0]?.id,
            )
        })

        //test case 5

        it('should assign a customer role to the user', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }
            await request(app).post('/auth/register').send(userData)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users[0]).toHaveProperty('role')
            expect(users[0]?.role).toBe(roles.CUSTOMER)
        })

        //test case 6

        it('should store the hashed password in the database', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            await request(app).post('/auth/register').send(userData)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find({ select: ['password'] })

            expect(users[0]?.password).not.toBe(userData.password)
            expect(users[0]?.password).toHaveLength(60)
            expect(users[0]?.password).toMatch(/^\$2b\$\d+\$/)
        })

        it('should return 400 if the email is already exist', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const userRepository = dataSource.getRepository(User)
            await userRepository.save({ ...userData, role: roles.CUSTOMER })

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            expect(response.status).toBe(400)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
        })

        it('should return the access token and refresh token in response', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                ['set-cookie']?: string[]
            }

            // 'set-cookie': [
            //     'access_token=jannakondeth; Max-Age=3600; Domain=localhost; Path=/; Expires=Tue, 04 Nov 2025 12:00:28 GMT; HttpOnly; SameSite=Strict',
            //     'refresh_token=jannakondeth; Max-Age=31536000; Domain=localhost; Path=/; Expires=Wed, 04 Nov 2026 11:00:28 GMT; HttpOnly; SameSite=Strict'
            //   ],

            let accessToken = null
            let refreshToken = null

            // expect(response.headers).toHaveProperty('set-cookie');

            const cookies = (response.headers as Headers)['set-cookie'] || []

            cookies.forEach((cookie) => {
                if (cookie.startsWith('access_token=')) {
                    accessToken = cookie.split(';')[0]?.split('=')[1]
                }
                if (cookie.startsWith('refresh_token=')) {
                    refreshToken = cookie.split(';')[0]?.split('=')[1]
                }
            })

            // console.log("accessToekn",accessToken)

            expect(accessToken).not.toBeNull()
            expect(refreshToken).not.toBeNull()

            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })

        it('should store refresh token in database', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const refreshTokenRepo = dataSource.getRepository(RefreshToken)
            // let refreshToken=await refreshTokenRepo.find({
            //     relations:{
            //         user:true
            //     }
            // })
            // expect(refreshToken[0]?.user?.id).toBe(response?.body?.id)

            const refreshToken = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany()

            // console.log("testrefresh",refreshToken)

            expect(refreshToken).toHaveLength(1)
        })
    })

    describe('Missing Fields with 400', () => {
        it('should return 400 if email field is missing', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: '',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(
                (response.body as Record<string, string>).errors?.length,
            ).toBeGreaterThan(0)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })
        it('should return 400 if firstName field is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.status).toBe(400)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })

        it('should return 400 if lastName field is missing', async () => {
            const userData = {
                firstName: 'janna',
                lastName: '',
                email: 'jannakondeth5@gmail.com',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.status).toBe(400)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })

        it('should return 400 if password field is missing', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannakondeth5@gmail.com',
                password: '',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.status).toBe(400)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })
    })

    describe('Fields are not format', () => {
        it('should trim the email', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: ' janna@gmail.com ',
                password: 'janna123',
            }

            await request(app).post('/auth/register').send(userData)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users[0]?.email).toBe('janna@gmail.com')
        })

        it('should return 400 status code if password length is less than 8 chars', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: ' janna@gmail.com ',
                password: 'jann',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.status).toBe(400)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(0)
        })

        it('should return 400 if it is not a valid email', async () => {
            const userData = {
                firstName: 'janna',
                lastName: 'jk',
                email: 'jannagmail',
                password: 'janna123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userRepository = dataSource.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(0)

            expect(response.status).toBe(400)
        })
    })
})

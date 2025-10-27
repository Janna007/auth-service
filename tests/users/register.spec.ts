import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
    describe('Registered Succesfully with 201', () => {
        //test case 1
        it('should return 201', async () => {
            const userData = {
                name: 'janna',
                username: 'jk',
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
                name: 'janna',
                username: 'jk',
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
    })
})

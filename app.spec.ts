import request from 'supertest'
import sum from './src/utils'
import app from './src/app'

describe('App', () => {
    it('should adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3)
    })

    it('should give 200', async () => {
        await request(app).get('/').send().expect(200)
    })
})

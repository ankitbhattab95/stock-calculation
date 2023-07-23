import request from 'supertest'
import 'dotenv/config';
import constants from '../src/constants.json'
import { App } from '../src/app';
const appInstance = new App();
const app = appInstance.getApp()


describe('Router checks', () => {

    it('GET /home --> should render with 200 status', async () => {
        const result = await request(app).get('/home')
        expect(result.statusCode).toEqual(200)
    })

    it('GET /stock --> should check for query param', async () => {
        const result = await request(app).get('/stock')
        expect(result.statusCode).toEqual(400)
        expect(result.body).toEqual({ success: false, message: constants.MISSING_PARAM_MSG })
    })

    it('GET /stock --> should send a failure response for invalid sku id', async () => {
        const result = await request(app).get('/stock?sku=1')
        expect(result.statusCode).toEqual(400)
        expect(result.body).toEqual({ success: false, message: constants.INVALID_SKU_MSG })
    })

    it('GET /stock --> should send a success response for valid sku id', async () => {
        const result = await request(app).get('/stock?sku=FZV366142/87/47')
        expect(result.statusCode).toEqual(200)
        expect(result.body.success).toEqual(true)
        expect(result.body).toHaveProperty('data')
        expect(result.body.data).toHaveProperty('sku')
        expect(result.body.data).toHaveProperty('qty')
    })
})
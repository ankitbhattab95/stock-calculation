import express from 'express';
import { StockRoutes } from './routes/stockRoutes';


export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.set('view engine', 'hbs')
        new StockRoutes(this.app);
    }
    public getApp() {
        return this.app
    }


}

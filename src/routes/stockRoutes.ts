import { Application, Request, Response } from 'express';
import { StockController } from '../controllers/stockController';

export class StockRoutes {
    private stockController: StockController;

    constructor(app: Application) {
        this.stockController = new StockController();
        this.route(app);
    }

    public route(app: Application) {
        app.get('/home', async (req: Request, res: Response) => {
            res.render('index', { "port": process.env.PORT })
        })

        app.get('/stock', async (req: Request, res: Response) => {
            try {
                if (!("sku" in req.query)) {
                    throw new Error('Missing query param: sku')
                }
                const sku: string = String(req.query.sku)
                console.log(`> Request received ${req.url}`)

                const result = await this.stockController.getStockInfo(sku);
                const response: { "success": boolean, "data": any } = { "success": true, "data": result }
                res.send(response)

                console.log(`> Response ${req.url} => ${JSON.stringify(response)}`)
            }
            catch (error: any) {
                console.log(error);
                res.status(400).send({ "success": false, "message": error.message })
            }
        });

    }
}

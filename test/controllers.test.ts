import 'dotenv/config';
import { App } from '../src/app';
const appInstance = new App();
const app = appInstance.getApp()
import { StockController } from '../src/controllers/stockController';
import constants from '../src/constants.json'
let stockController = new StockController();

describe('Controller checks', () => {

    it('should throw an Error if the file is not read successfully', async () => {
        constants.STOCK_FILE_PATH='./invalid/path.json'
        try {
            const result = await stockController.getStockInfo('random')
        } catch (error) {
            expect(error).toBeDefined()

        }
    })

    it('should set available stock to 0, if sku is missing in stock file but present in transactions', async () => {
        const getFileData = jest.spyOn(StockController.prototype as any, 'getFileData');
        const mockTransactionFile = [
            {
                "sku": "missingInStockFilePresentInTransactionFile",
                "type": "refund",
                "qty": 8
            },
            {
                "sku": "missingInStockFilePresentInTransactionFile",
                "type": "order",
                "qty": 2
            }]
        const mockStockFile = [{}]
        getFileData.mockImplementation((filename) => {
            if (filename === constants.STOCK_FILE_PATH) {
                return mockStockFile
            }
            else if (filename === constants.TRANSACTION_FILE_PATH) {
                return mockTransactionFile
            }
        });

        const result = await stockController.getStockInfo(mockTransactionFile[0].sku)
        expect(result).toEqual({
            "sku": mockTransactionFile[0].sku,
            "qty": mockTransactionFile[0].qty - mockTransactionFile[1].qty
        })
    })

    it('should throw an Error, if sku is missing in both the files', async () => {
        const getFileData = jest.spyOn(StockController.prototype as any, 'getFileData');
        const mockTransactionFile = [{}]
        const mockStockFile = [{}]
        getFileData.mockImplementation((filename) => {
            if (filename === constants.STOCK_FILE_PATH) {
                return mockStockFile
            }
            else if (filename === constants.TRANSACTION_FILE_PATH) {
                return mockTransactionFile
            }
        });

        try {
            const result = await stockController.getStockInfo('random')
        } catch (error: any) {
            expect(error.message).toEqual('Invalid SKU')
        }
    })

    it('should subtract the "order" type transactions from the initial stock value', async () => {
        const getFileData = jest.spyOn(StockController.prototype as any, 'getFileData');
        const mockTransactionFile = [{
            "sku": "randomStock",
            "type": "order",
            "qty": 8
        },
        {
            "sku": "randomStock",
            "type": "order",
            "qty": 20
        }]
        const mockStockFile = [{
            "sku": "randomStock",
            "stock": 8525
        }]
        const initialLevel = mockStockFile[0].stock
        getFileData.mockImplementation((filename) => {
            if (filename === constants.STOCK_FILE_PATH) {
                return mockStockFile
            }
            else if (filename === constants.TRANSACTION_FILE_PATH) {
                return mockTransactionFile
            }
        });

        const result = await stockController.getStockInfo(mockStockFile[0].sku)
        expect(result).toEqual({
            "sku": mockStockFile[0].sku,
            "qty": initialLevel - mockTransactionFile[0].qty - mockTransactionFile[1].qty
        })
    })

    it('should add the "refund" type transactions to the initial stock value', async () => {
        const getFileData = jest.spyOn(StockController.prototype as any, 'getFileData');
        const mockTransactionFile = [{
            "sku": "randomStock",
            "type": "refund",
            "qty": 8
        },
        {
            "sku": "randomStock",
            "type": "refund",
            "qty": 20
        }]
        const mockStockFile = [{
            "sku": "randomStock",
            "stock": 8525
        }]
        const initialLevel = mockStockFile[0].stock
        getFileData.mockImplementation((filename) => {
            if (filename === constants.STOCK_FILE_PATH) {
                return mockStockFile
            }
            else if (filename === constants.TRANSACTION_FILE_PATH) {
                return mockTransactionFile
            }
        });

        const result = await stockController.getStockInfo(mockStockFile[0].sku)
        expect(result).toEqual({
            "sku": mockStockFile[0].sku,
            "qty": initialLevel + mockTransactionFile[0].qty + mockTransactionFile[1].qty
        })
    })


})
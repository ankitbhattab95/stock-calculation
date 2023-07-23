import { readFile } from 'fs';
import { resolve } from 'path';
import constants from '../constants.json'

export class StockController {

    public async getStockInfo(sku: string): Promise<{ "sku": string, "qty": number }> {
        // read stocks.json and transactions.json in async manner
        let [stocks, transactions] = await Promise.all([
            this.getFileData(String(constants.STOCK_FILE_PATH)),
            this.getFileData(String(constants.TRANSACTION_FILE_PATH))
        ])

        // filter stocks by sku
        const stock = stocks.filter((stock: { "sku": string, "stock": number }) => {
            if (stock.sku == sku) {
                return stock
            }
        })

        // if sku is missing in stock file, set available stock to 0
        let isStockPresent: boolean = true
        if (stock.length === 0) {
            isStockPresent = false
            stock.push({ sku, stock: 0 })
        }

        // for a given sku, modify the available stock according to each transaction's order/refund
        let isTransactionPresent: boolean = false
        transactions.forEach((transaction: { "sku": string, "type": string, "qty": number }) => {
            if (transaction.sku === sku) {
                isTransactionPresent = true
                if (transaction.type === "order") {
                    stock[0].stock -= transaction.qty
                } else if (transaction.type === "refund") {
                    stock[0].stock += transaction.qty
                }
            }
        });

        // throw an error for sku missing in both stockJson and transactionJson files
        if (!isTransactionPresent && !isStockPresent) {
            throw new Error(constants.INVALID_SKU_MSG)
        }

        return { sku, "qty": stock[0].stock }
    }

    private getFileData(filename: string): Promise<any> {
        return new Promise((res, rej) => {
            readFile(resolve(__dirname, filename), 'utf8', (err, data) => {
                if (err) {
                    rej(err)
                } else {
                    res(JSON.parse(data))
                }
            })
        })
    }

}
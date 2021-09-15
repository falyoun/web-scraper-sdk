import * as path from "path";
import * as fs from "fs";
import { Page } from 'puppeteer'
import {createDirectoryIfItDoesNotExist} from "@app/utils";

export const downloadImages = (page: Page) => {
    page.on('response', async response => {
        const url = response.url();
        if (response.request().resourceType() === 'image') {
            response.buffer().then(file => {
                try {
                    let fileName = url.split('/').pop() || '';
                    if (fileName.includes('?')) {
                        fileName = fileName.substr(0, fileName.indexOf('?'));
                    }
                    if (!fileName.includes('.')) {
                        fileName = `${fileName}.png`;
                    }
                    const filePath = path.resolve(__dirname, '..', './public', fileName);
                    console.log({filePath});
                    const directory = filePath.substr(0, filePath.indexOf(fileName) - 1);
                    createDirectoryIfItDoesNotExist(directory);
                    console.log({directory});
                    const writeStream = fs.createWriteStream(filePath);
                    writeStream.write(file);
                } catch (e) {
                    console.error(`Error while downloading image: `, e)
                }
            })
        }
    });
};

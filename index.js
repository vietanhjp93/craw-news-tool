/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Main of crawl app
 * all function is call here
 */

const s3Info = require('./data/s3-info');
const crawlNews = require('./services/crawlNews');
const furiganaGet = require('./services/furiganaGet');
const translate = require('./services/translate');
const uploadFile = require('./services/uploadFile');
const splitNewsContent = require('./services/splitNewsContent');
const s3UploadFile = require('./services/s3-upload');
const checkJsonFile = require('./tools/checkJsonFile');
const fs = require('fs');
const log = require('./tools/log');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log("client connected");
    res.send("Welcome to the home page baby");
} )
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("web online");
})



global.logFlag = true;

/**
* 0:all log log
* 1:notification
* 2:only top log
*/
global.logLevel = 2;

async function gogo() {
    // await crawlNews.crawlNewsMainFunc();
    await splitNewsContent.splitNewsContentFunc();
    // await translate.translateFunc();
    // await furiganaGet.furiganaGetFunc();
    // await uploadFile.uploadToCloud();
    // await s3UploadFile.s3UploadFileFunc();


    // await checkJsonFile.checkJsonFileFunc();
}

gogo();
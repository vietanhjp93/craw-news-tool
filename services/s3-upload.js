const log = require('../tools/log');
const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: global.accessKeyId,
  secretAccessKey: global.secretAccessKey
});


async function main () {
    for (let res of global.urls) {
        if (res.url === 'https://news.yahoo.co.jp/categories/domestic') {
            saveHotToOneFile();
            let hotRes = {
                url: 'https://news.yahoo.co.jp/categories/domestic',
                category: "hot",
                fullPathNews: require("path").resolve("./data/hot.json")
            }
            await uploadFile(res);
        } else if (res.url === 'https://news.yahoo.co.jp/categories/world') {
            // do nothing
        } else {
            await uploadFile(res);
        }
    }
}

function saveHotToOneFile() {
    let newsHot1;
    let newsHot2;
    try {
        let temp1 = fs.readFileSync(global.urls[0].fullPathNews)
        newsHot1 = JSON.parse(temp1);
        let temp2 = fs.readFileSync(global.urls[1].fullPathNews)
        newsHot2 = JSON.parse(temp2);
    } catch (error) {
        log.logFunc(0, error);
        log.logFunc(0, 'file not found');
    }
    for (let i = newsHot2.length - 1; i >= 0; i--) {
        newsHot1.splice(0, 0, newsHot2[i]);
    }
    if (newsHot1.length > 100) {
        newsHot1.splice(100, newsHot1.length - 100);
    }
    const path = require("path").resolve("./data/hot.json");
    fs.writeFileSync(path, JSON.stringify(newsHot1));
}

const uploadFile = async (res) => {
    log.logFunc(2, 'Start upload file to S3');
    fs.readFile(res.fullPathNews, (err, data) => {
        // console.log(`uploaded data ${data}`)
        if (err) throw err;
        const params = {
            Bucket: 'learn-japanese-easy-news-data', // pass your bucket name
            Key: `${res.category}.json`, // file will be saved as testBucket/contacts.csv
            Body: data
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            log.logFunc(2, `Done!! upload file to S3 ${data.Location}`);
        });
    });
};

exports.s3UploadFileFunc = main;
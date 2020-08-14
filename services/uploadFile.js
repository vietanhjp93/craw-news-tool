/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Upload json file to google storage
 */

const log = require('../tools/log');
const { Storage } = require('@google-cloud/storage');
const path = require("path");
const fullPathNews = path.resolve("./data/translatedNews.json");
const storage = new Storage({ keyFilename: './data/LearnJapaneseEasy-e6d3083eb9c4.json' });

const bucketname = 'news-list-folder';
const filename = 'translatedNews.json';

const uploadToCloud = async () => {
    log.logFunc(2, "Start upload file to cloud");
    // Replace with your bucket name and filename.
    
    const res = await storage.bucket(bucketname).upload(fullPathNews);
    log.logFunc(2, "upload file to cloud ok");
    // `mediaLink` is the URL for the raw contents of the file.
    // const url = res[0].metadata.mediaLink;
    
    // Need to make the file public before you can access it.
    await storage.bucket(bucketname).file(filename).makePublic();
    
    log.logFunc(2, "make file public ok");

    // Make a request to the uploaded URL.
    // const axios = require('axios');
    // const getDataFromUrl = await axios.get(url).then(res => res.data);
    log.logFunc(0, res);
    log.logFunc(2, "Done!! upload file to cloud");

}

exports.uploadToCloud = uploadToCloud;
/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Only use for check json file
 */


const fs = require('fs');
const path = require("path");
const fullPathNews = path.resolve("./data/sports.json");



const checkJsonFile = async () => {
    getNewsJson();

};
exports.checkJsonFileFunc = checkJsonFile;
function getNewsJson() {
    let json;
    try {
        let temp = fs.readFileSync(fullPathNews)
        json = JSON.parse(temp);
    } catch (error) {
        console.log(error);
        console.log('file not found');
    }
    for (let news of json) {
        // console.log(news.newContent);
        // console.log(news.newContentWithFurigana);
        console.log(news.newContent.length);
        console.log(news.newContentVi.length);
        
    }
    // console.log(list);
}
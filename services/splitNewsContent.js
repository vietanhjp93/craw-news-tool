/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Split the news content to smaller content
 * Because display style in smartphone is block display
 */

const fs = require('fs');
const log = require('../tools/log');

async function main () {
    for (let res of global.urls) {
        await splitNewsContent(res.fullPathNews);
    }
}

const splitNewsContent = async (fullPathNews) => {
    log.logFunc(2, 'Start split news content');
    try {
        let regexJa = /[。\n]+(?=(?:[^\」]*\「[^\「]*\」)*[^\」]*$)/g; // /<a.*?\" /g
        // let regexVi = /[.\n]+(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;
        let temp = fs.readFileSync(fullPathNews)
        newsInLocal = JSON.parse(temp);
        log.logFunc(1, newsInLocal[6].newContentVi);
        
        log.logFunc(`newsInLocal: ${newsInLocal}`);
        for (const news of newsInLocal) {
            log.logFunc(0, news.newContentVi);
            log.logFunc(0, news.newContent);
            // news.newContentVi = news.newContentVi.split(regexVi);
            if ((!!news.newContent) && (news.newContent.constructor === Array)) {
                // split done, do nothing
            } else {
                news.newContent = news.newContent.split(regexJa);
            }
            // news.newContent
            log.logFunc(0, news.newContentVi.length);
            log.logFunc(0, news.newContent.length);
            log.logFunc(0, news.newContentVi);
            log.logFunc(0, news.newContent);
        }
        log.logFunc(0, `news after split: ${newsInLocal}`);
        fs.writeFileSync(fullPathNews, JSON.stringify(newsInLocal));
        log.logFunc(2, 'Done!! split news content');
  } catch (error) {
      log.logFunc(2, error);
      log.logFunc(2, 'file not found');
  }
}
exports.splitNewsContentFunc = main;
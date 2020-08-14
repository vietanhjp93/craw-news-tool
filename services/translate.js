/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Translate japanese to vietnamese function
 */
// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;
// Instantiates a client
const projectId = 'learnjapaneseeas-1593326463256';
const key = process.env.translateKey;
const translate = new Translate({projectId, key});

const fs = require('fs');
const log = require('../tools/log');

async function main () {
    for (let res of global.urls) {
        await quickTranslate(res.fullPathNews);
    }
}

const quickTranslate = async (fullPathNews) => {
  // The text to translate
  try {
        log.logFunc(2, 'Start translate news');
        let temp = fs.readFileSync(fullPathNews)
        newsInLocal = JSON.parse(temp);
        // The target language
        const target = 'vi';
        log.logFunc(1, `newsInLocal: ${newsInLocal}`);
        for (const news of newsInLocal) {
            log.logFunc(0, `short title: ${news.shortTitle}`);
            if (!news.newTitleVi) {
                const [translatedNewTitle] = await translate.translate(news.newTitle, target);
                news.newTitleVi = translatedNewTitle;
                news.newContentVi = [];
                for (const res of news.newContent) {
                    const [translatedNewContent] = await translate.translate(res, target);
                    news.newContentVi.push(translatedNewContent);
                }
                log.logFunc(0, `news translated: ${JSON.stringify(news)}`);
            }
        }
        fs.writeFileSync(fullPathNews, JSON.stringify(newsInLocal));
        log.logFunc(2, 'Done!! translate news');
  } catch (error) {
      log.logFunc(2, error);
      log.logFunc(2, 'file not found');
  }

}
exports.translateFunc = main;
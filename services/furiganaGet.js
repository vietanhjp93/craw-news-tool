/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Get the furigana of kanji using converter web
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const log = require('../tools/log');


let browser = null;
let pages = null;
let page = null;

const crawlNews = async () => {
    log.logFunc(2, 'Start convert kanji to furigana');
    // Fist setup for browser
    browser = await puppeteer.launch({ 
        headless: false,
        devtools: true,
        timeout:0 
    });
    pages = await browser.pages();
    page = pages[0];
    const url = 'http://www.lsx.jp/converter/kana/index.html';
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    log.logFunc(2, 'Page convert kanji to furigana loaded');

    for (let res of global.urls) {
        let jsonWithFurigana = await getTextInput(getNewsJson(res.fullPathNews));
        // Get list of news on top site
        await addDataToLocalJson(res.fullPathNews, jsonWithFurigana);
    }

    // Crawl done! End browser
    await browser.close();
    
    // Add data to local data

    log.logFunc(2, 'Done!! convert kanji to furigana');
};
exports.furiganaGetFunc = crawlNews;

async function getTextInput(newsJson) {
    for (let news of newsJson) {
        let ruby = news.shortTitle.match(/<ruby>/);
        console.log(ruby)
        if (!ruby || ruby[0] !== '<ruby>') {
            news.shortTitle = await getFurigana(news.shortTitle);
            news.newTitle = await getFurigana(news.newTitle);
            let newContentWithFurigana = [];
            for (let content of news.newContent) {
                if ((content === '') || (content === '　')) {
                    newContentWithFurigana.push('');
                } else {
                    newContentWithFurigana.push(await getFurigana(content));
                }
            }
            news.newContent = newContentWithFurigana;
        }
    }

    return newsJson;
}

async function getFurigana(kanji) {
    let newsWithFurigana = '';

    // reset button click
    await page.$eval( '#reset', form => form.click() );

    // clean input area before put text to inside
    await page.evaluate(function clean() {
        const input = document.querySelector('#srcText');
        input.value = '';
      });

    // focus to input area
    await page.focus('#srcText')

    // put text to input area
    await page.keyboard.type(kanji);

    // click 変換 button
    await page.$eval( '#convert', form => form.click() );

    try {
        // wait the process done before get the result
        await page.waitFor(() => document.querySelectorAll('#destHtmlPreview > p').length > 0);
    } catch (err) {
        log.logFunc(2, "ruby not found...")
    }
    // get the result with furigana of outerHTML
    newsWithFurigana = await page.$$eval('#destHtmlPreview > p', options => options.map(option => option.outerHTML));
    
    return newsWithFurigana[0];
}

function addDataToLocalJson(fullPathNews, jsonWithFurigana) {
    fs.writeFileSync(fullPathNews, JSON.stringify(jsonWithFurigana));
}

function getNewsJson(fullPathNews) {
    let json;
    try {
        let temp = fs.readFileSync(fullPathNews)
        json = JSON.parse(temp);
    } catch (error) {
        log.logFunc(2, error);
        log.logFunc(2, 'file not found');
    }
    log.logFunc(0, json);
    return json;
}

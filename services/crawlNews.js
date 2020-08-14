/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Crawl news in website to local
 * 
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const log = require('../tools/log');

let browser = null;
let pages = null;
let page = null;

let newsInLocal = [];



async function main () {
    log.logFunc(2, 'Start crawl news');
    // Fist setup for browser
    browser = await puppeteer.launch({ 
        headless: true,
        // devtools: true,
        timeout:0 
    });
    pages = await browser.pages();
    page = pages[0];

    for (let res of global.urls) {
        newsInLocal = [];
        await crawlNews(res);
        // await getListNewsLife(res);
        log.logFunc(2, 'Done!! crawl ' + res.category);
    }
    // await getContentOfNew(urls[0], urls[0].category);



    await browser.close();

    log.logFunc(2, 'Done!! crawl news');
    
}

const crawlNews = async (res) => {

    let listNewsLeastOnTopSite = [];
    // Get list of news on top site
    if (res.category === 'life') {
        listNewsLeastOnTopSite = await getListNewsLife(res.url);
    } else {
        listNewsLeastOnTopSite = await getListNews(res.url);
    }
    
    // Delete element if available in the local
    let listOfNewsNotInLocal = filterNewLeast(listNewsLeastOnTopSite, res.fullPathNews);

    // Return if no have a new news
    if (listOfNewsNotInLocal.length === 0) {
        log.logFunc(2, 'not have new news');
        if (res.category === 'life') {
            await browser.close();
        }
        // upload.uploadToCloud();
        return;
    }

    // Get the real URL direct to the news
    let listRealUrlDirectToNews = [];
    if (res.category === 'life') {
        listRealUrlDirectToNews = listOfNewsNotInLocal;
    } else {
        for (const res of listOfNewsNotInLocal) {
            listRealUrlDirectToNews.push(await getLinkOfNew(res));
        }
    }

    // Crawl data from real URL
    let newsObject = [];
    for (let i = 0 ; i < listRealUrlDirectToNews.length; i++) {
        let tempObj = await getContentOfNew(listRealUrlDirectToNews[i], res.category);
        if (tempObj.newContent) {
            newsObject.push(tempObj);
        }
    }
    log.logFunc(0, newsObject);

    // Crawl done! End browser
    
    // Add data to local data
    addDataToLocalJson(newsObject, res.fullPathNews);


};

function addDataToLocalJson(newsObject, fullPathNews) {
    log.logFunc(0, newsInLocal);
    if (newsInLocal) {
        for (let i = newsObject.length - 1; i >= 0; i--) {
            newsInLocal.splice(0, 0, newsObject[i]);
        }
    } else {
        newsInLocal = newsObject;
    }
    if (newsInLocal.length > 100) {
        newsInLocal.splice(100, newsInLocal.length - 100);
    }
    fs.writeFileSync(fullPathNews, JSON.stringify(newsInLocal));
}

function filterNewLeast(list, fullPathNews) {
    try {
        let temp = fs.readFileSync(fullPathNews)
        newsInLocal = JSON.parse(temp);
    } catch (error) {
        log.logFunc(0, error);
        log.logFunc(0, 'file not found');
    }

    if ((newsInLocal !== null) && (newsInLocal[0])) {
        let indexOfNew = list.findIndex(res => newsInLocal[0].shortTitle === res.shortTitle);

        log.logFunc(0, newsInLocal);
        if (indexOfNew !== -1) {
            list.splice(indexOfNew, list.length - indexOfNew);
        }
    }
    log.logFunc(1, list);
    return list;
}

const getListNewsLife = async function(url) {
    let topSiteNewsList = [];
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    log.logFunc(2, 'Page loaded ' + url);
    

    // Get URL to the info page of the news
    const urlList = await page.evaluate(() => {
        let titleLinks = document.querySelectorAll('#newsFeed > ul > li > div > a');
        titleLinks = [...titleLinks];
        let articles = titleLinks.map(link => ({
            // title: link.getAttribute('title'),
            url: link.getAttribute('href')
        }));
        return articles;
    });
    
    let newImage = await page.$$eval('#newsFeed > ul > li > div > a > div > div > img', options => options.map(option =>  option.getAttribute('src')));
    let newContent = await page.$$eval('#newsFeed > ul > li > div > a > div.newsFeed_item_text > div.newsFeed_item_title', options => options.map(option => option.textContent));

    for (let i = 0 ; i < urlList.length; i++) {
        topSiteNewsList.push(
            {
                url: urlList[i].url,
                image: newImage[i], 
                shortTitle: ''
            }
        );
    }

    log.logFunc(0, topSiteNewsList);
    return topSiteNewsList;
}

const getListNews = async function(url) {
    let topSiteNewsList = [];
    await page.goto(url, {waitUntil: 'load', timeout: 0});
    log.logFunc(2, 'Page loaded ' + url);
    

    // Get URL to the info page of the news
    const urlList = await page.evaluate(() => {
        let titleLinks = document.querySelectorAll('li.topicsListItem > a');
        titleLinks = [...titleLinks];
        let articles = titleLinks.map(link => ({
            // title: link.getAttribute('title'),
            url: link.getAttribute('href')
        }));
        return articles;
    });
    
    
    // Get short title in top of the site
    let shortTitleList = [];
    const getList = await page.$$('li.topicsListItem');
    for (const element of getList) {
        let label = await page.evaluate(el => el.innerText, element);
        shortTitleList.push(label);
    }
    for (let i = 0 ; i < shortTitleList.length; i++) {
        topSiteNewsList.push({shortTitle: shortTitleList[i], url: urlList[i].url});
    }

    log.logFunc(0, topSiteNewsList);
    return topSiteNewsList;
}

const getLinkOfNew = async function(res) {
    await page.goto(res.url, {waitUntil: 'load', timeout: 0});
    log.logFunc(1, 'Page LinkOfNew loaded ' + res.url);

    // Get real link to the news content
    const getLinkOfNew = await page.evaluate(() => {
        let titleLinks = document.querySelectorAll('p.pickupMain_detailLink > a');
        titleLinks = [...titleLinks];
        let articles = titleLinks.map(link => link.getAttribute('href'));
        return articles;
    });
    let newImage = await page.$$eval('div.pickupMain_image.pickupMain_image-picture > picture > source', options => options.map(option =>  option.getAttribute('srcset')));
    let newImage1 = await page.$$eval('div.pickupMain_image.pickupMain_image-picture > picture > img', options => options.map(option =>  option.getAttribute('src')));
    let allImage = newImage.concat(newImage1);
    let image = '';
    if (allImage[2]) {
        image = allImage[2];
    }
    
    let object = {
        url : getLinkOfNew[0],
        image: image,
        shortTitle: res.shortTitle
    }
    log.logFunc(0, object);
    return object;
}

const getContentOfNew = async function(res, category) {
    await page.goto(res.url, {waitUntil: 'load', timeout: 0});
    log.logFunc(1, 'Page target Content' + res.url);

    // Get the full title of news
    let newTitle = await page.$$eval('header > h1.sc-cmTdod.hpDMzp', options => options.map(option => option.textContent));
    if (newTitle.length == 0) {
        newTitle = await page.$$eval('#uamods > header > h1', options => options.map(option => option.textContent));
    }

    // Get the content of news
    let newContent = await page.$$eval('p.sc-dVhcbM.hFPXIO.yjDirectSLinkTarget', options => options.map(option => option.textContent));
    if (newContent.length == 0) {
        newContent = await page.$$eval('#uamods > div.article_body > div > p', options => options.map(option => option.textContent));
    }
    // let timeStamp = await page.$$eval('#uamods > footer > div > time', option => option.map(op => op.textContent));
    let sources = await page.$$eval('#uamods > footer > a', option => option.map(op => op.textContent));
    
    // Try get title again
    if (!newTitle[0]) {
        newTitle = await page.$$eval('#content-body > section > div > div.hd > h1', options => options.map(option => option.textContent));
    }

    // Try get content again
    if (!newContent[0]) {
        newContent = await page.$$eval('#ual', options => options.map(option => option.textContent));
    }
    let subImage;
    let videoUrl;
    if (!res.image) {
        subImage = await page.$$eval('#uamods > div.article_body > div > div > div > a > div > picture > img', options => options.map(option =>  option.getAttribute('src')));
        if (!subImage[0]) {
            try {
                const elementHandle = await page.$('#yvpubplayer0');
                const frame = await elementHandle.contentFrame();
                let temp = await frame.$$eval('div.vjs-poster', options => options.map(option =>  option.getAttribute('style')));
                if (temp[0]) {
                    subImage = temp[0].match(/http.*?(?=")/g);
                }
            } catch (err) {
                log.logFunc(2, "deo hieu loi gi....");
            }
        }
    }
    

    let countWord = newTitle[0].length + newContent[0].length;
    // Creat object of the news
    let newObject = {
        shortTitle: res.shortTitle,
        newTitle: newTitle[0], 
        newContent: newContent[0], 
        image: res.image ? res.image : subImage[0],
        newTitleVi: '',
        newContentVi: '',
        url: res.url,
        source: sources[0],
        countWord: countWord,
        readCount: 0,
        category: category
    };
    log.logFunc(0, newObject);
    return newObject;
}

exports.crawlNewsMainFunc = main;
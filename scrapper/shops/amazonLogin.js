const puppeteer = require('puppeteer');
const { emailAmazon, passwordAmazon } = require('../../config/general');


let browser;
let page;
const amazonURLLogin = 'https://www.amazon.es/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.es%2Fs%3Fk%3Dcamping%26rh%3Dn%253A2928471031%26dc%26__mk_es_ES%3D%25C3%2585M%25C3%2585%25C5%25BD%25C3%2595%25C3%2591%26crid%3D2P7OKG78IRMMW%26qid%3D1643721575%26refresh%3D1%26rnid%3D1703620031%26sprefix%3Dcampin%252Caps%252C551%26ref%3Dnav_custrec_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=esflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&'
// TODO: CAMBIAR EL VALOR DE TIMER EN CONFIG/GENERAL.JS
const amazonLogin = async () => {
    
    browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--start-maximized'
        ],
        userDataDir: './user_data',
        defaultViewport: null,
        // slowMo: 100
    });
    page = await browser.newPage();
    await page.goto(amazonURLLogin);
    // write text to input
    await page.type('#ap_email', emailAmazon);
    await page.click('#continue');
    await page.waitForNavigation();
    await page.type('#ap_password', passwordAmazon);
    await page.click('#signInSubmit');
    await page.waitForNavigation();
    await browser.close();
}
amazonLogin();
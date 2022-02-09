const puppeteer = require('puppeteer');
const { amazonURL } = require('../../config/general');
const autoScroll = require('../../helpers/autoScroll');
const Product = require('../../models/Product');


let browser;
let page;
let count = 1;
let countPage = 0;
let getNextPage = '';

const scrapAmazon = async ({url, countProduct}) => {
    // Instancia el navegador por primera vez (sirve para la paginacion)
    if (countPage == 0) {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--start-maximized'
            ],
            userDataDir: './user_data',
            defaultViewport: null,
        });
        page = await browser.newPage();
        await page.goto(amazonURL);
        await page.setDefaultTimeout(0);
    }
    // Dandose el caso de que sea la segunda vuelta, navegará a la siguiente página
    if (countPage >= 1) await page.goto(url);
    // Espera a que se cargue la página y selecciona todos los items
    const selectorItemPage = await page.$$('span:nth-child(4) > div.s-main-slot.s-result-list.s-search-results.sg-row > div.sg-col-4-of-12.s-result-item > div.sg-col-inner');
    await autoScroll(page);
    const selectorNextPage = await page.$('div > div > span > a.s-pagination-button.s-pagination-separator.s-pagination-next');
    getNextPage            = await page.evaluate(el => 'https://www.amazon.es' + el.getAttribute('href'), selectorNextPage);

    // Recorre todos los items
    for (const item of selectorItemPage) {
        // Selecciona el item
        const selectorName       = await item.$('div.a-section.a-spacing-small.s-padding-left-small.s-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style > h2 > a');
        const selectorImg        = await item.$('div > div > div > div > div > div > div.s-product-image-container.aok-relative.s-image-overlay-grey.s-text-center.s-padding-left-small.s-padding-right-small.s-spacing-small.s-height-equalized > span > a > div > img');
        const selectorPrice      = await item.$('div.a-section.a-spacing-small.s-padding-left-small.s-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div > a > span:nth-child(1) > span.a-offscreen');
        const selectorOfertPrice = await item.$('a > span.a-price.a-text-price > span:nth-child(2)');
        const selectorCupon      = await item.$('div > div > div > div > div.a-section.a-spacing-small.s-padding-left-small.s-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div.a-row.a-size-base.a-color-secondary > span > span.s-coupon-unclipped > span.a-size-base.s-highlighted-text-padding.aok-inline-block.s-coupon-highlight-color');
        const selectorSendFree   = await item.$('div > div:nth-child(2) > span > span.a-color-base');
        // Verifica si existen los items (los cupoens son opcinoales)
        if (
            selectorCupon && selectorName && selectorImg && selectorPrice && selectorOfertPrice && selectorSendFree ||
            selectorName && selectorImg && selectorPrice && selectorOfertPrice && selectorSendFree 
        ) {
            // Obtiene los datos de los items
            const getName       = await page.evaluate(el => el.innerText, selectorName);
            const getUrl        = await page.evaluate(el => {return 'https://www.amazon.es' + el.getAttribute('href')}, selectorName);
            const getImg        = await page.evaluate(el => el.getAttribute('src'), selectorImg);
            const getPrice      = await page.evaluate(el => el.innerText, selectorPrice);
            const getOfertPrice = await page.evaluate(el => el.innerHTML, selectorOfertPrice);
            const getSendFree   = await page.evaluate(el => el.innerText, selectorSendFree);
            let   getCupon = '';

            if (selectorCupon) {
                getCupon  = await page.evaluate(el => el.innerText, selectorCupon);
            }
            // Verifica si el producto existe antes de guardarlo
            const productExist = await Product.findOne({name: getName});

            if (!productExist) {
                // Busca el link de afiliados y lo obtiene
                const productItem = await browser.newPage();
                await productItem.setDefaultTimeout(0);
                await productItem.goto(getUrl);
                await productItem.click('#amzn-ss-text-link > span > strong > a');
                await productItem.waitForTimeout(3000);
                const selectAffiliateUrl = await productItem.$('#amzn-ss-text-shortlink-textarea');
                let getAffiliateUrl = '';
                // Verifica el link de afiliados, caso contrario no hace nada
                if (selectAffiliateUrl) {
                    // Obtiene link
                    getAffiliateUrl = await productItem.evaluate(el => el.innerHTML, selectAffiliateUrl);
                    await productItem.close();
                    // Lo guarda en el modelo
                    const product = new Product({
                        name:   getName,
                        url:    getAffiliateUrl,
                        img:    getImg,
                        price:  getPrice,
                        ofertPrice: getOfertPrice,
                        shop:  'Amazon',
                        cupon:  getCupon,
                        envio:  getSendFree
                    });
                    await product.save()
                    if (count === countProduct) return browser.close();
                    count++;
                }
            }
        }
    }
    // Cuando ya se tenga la cantidad igualada de productos de general.js, se cierra el navegador
    if(count === countProduct || !selectorNextPage) return browser.close();    
    countPage++;
    // Funcion recursiva para la paginacion
    await scrapAmazon({url: getNextPage, countProduct});
}

module.exports = scrapAmazon;
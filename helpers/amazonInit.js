const { default: axios } = require("axios");
const { chatId } = require("../config/general");
const { getAmazonProduct } = require("./getProductAmazon");

const amazonInit = async () => {
    const product = await getAmazonProduct();
    axios.post('https://api.telegram.org/bot5223950148:AAH77S9OPF6HI5aSn5T78P865TaTMCJFehg/sendPhoto', {
            "chat_id": chatId,
            "caption": `<b>${product.shop}</b> <s>${product.ofertPrice}</s> <b>${product.price}</b> <i>${product.envio}</i>\n${product.cupon ? `\n <b>${product.cupon} con cupones</b>\n` : ''}\n${product.name}\n \n<a href="${product.url}">Ver producto</a>\n \nVisto en @OfertonesCamper`,
            "photo": `${product.img}`,
            "parse_mode": "HTML"
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
}

module.exports = { amazonInit };
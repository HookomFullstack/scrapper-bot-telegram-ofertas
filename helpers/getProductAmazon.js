const { countProduct } = require("../config/general");
const Product = require("../models/Product");
const scrapAmazon = require("../scrapper/shops/amazon");

const getAmazonProduct = async () => {
    const product = await Product.findOne({ 
        send: false 
    });
    if (!product) {
        await scrapAmazon({countProduct});
        return getAmazonProduct();
    }
    product.send = true;
    await product.save();
    return product;
}

module.exports = { getAmazonProduct };
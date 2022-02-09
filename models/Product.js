const mongoose = require('mongoose');

// Schema Product
const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    ofertPrice: {
        type: String,
        required: true
    },
    cupon: {
        type: String,
    },
    envio: {
        type: String,
        required: true
    },
    shop: {
        type: String,
        required: true
    },
    send: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productsSchema);
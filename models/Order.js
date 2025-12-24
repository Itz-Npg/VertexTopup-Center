const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    item: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    status: { type: String, default: 'Processing' }, // Processing, Completed, Cancelled
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

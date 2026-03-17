let mongoose = require('mongoose');

let orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'quantity phải lớn hơn 0']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'price không được nhỏ hơn 0']
    }
}, { _id: false });

let orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0,
        min: [0, 'totalPrice không được nhỏ hơn 0']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        type: String,
        default: ""
    },
    note: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('order', orderSchema);

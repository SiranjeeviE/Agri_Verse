const mongoose = require('mongoose');

const marketListingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    crop: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    contact_info: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['available', 'sold'],
        default: 'available'
    },
}, {
    timestamps: true,
});

const MarketListing = mongoose.model('MarketListing', marketListingSchema);

module.exports = MarketListing;

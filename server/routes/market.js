const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const MarketListing = require('../models/MarketListing');

// @route   GET /api/market
// @desc    Get all market listings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const listings = await MarketListing.find({ status: 'available' })
            .sort({ createdAt: -1 })
            .populate('user', 'name phone');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/market
// @desc    Create a new listing
// @access  Private
router.post('/', protect, async (req, res) => {
    const { crop, quantity, price, contact_info } = req.body;

    try {
        const listing = new MarketListing({
            user: req.user._id,
            crop,
            quantity,
            price,
            contact_info,
        });

        const createdListing = await listing.save();
        res.status(201).json(createdListing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

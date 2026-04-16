const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

/**
 * @route GET /api/public/profile/:slug
 * @desc Get a public digital business card by its URL slug.
 * @access Public
 */
router.get('/profile/:slug', publicController.getPublicProfile);

module.exports = router;

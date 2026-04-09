const express = require('express');
const router = express.Router();
const { signUpload } = require('../controllers/cloudinaryController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/sign', protect, adminOnly, signUpload);

module.exports = router;

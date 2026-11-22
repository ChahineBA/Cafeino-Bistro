const express = require('express');
const router = express.Router();
const { getReceiptSettings, updateReceiptSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/auth');

// Any logged-in user can read (waiters print receipts); only admins can change.
router.route('/receipt')
  .get(protect, getReceiptSettings)
  .put(protect, admin, updateReceiptSettings);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getServices,
  getServicesByDate,
  getActiveService,
} = require('../controllers/serviceController');
const { protect, admin } = require('../middlewares/auth');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/', protect, getServices);
router.get('/date/:date', protect, admin, getServicesByDate);
router.get('/active', protect, getActiveService);

module.exports = router;

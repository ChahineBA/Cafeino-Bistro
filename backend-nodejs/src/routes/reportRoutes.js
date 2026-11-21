const express = require('express');
const router = express.Router();
const {
  getRevenueReport,
  getOrderStats,
  getWaiterPerformance,
  getTopProducts,
} = require('../controllers/reportController');
const { protect, admin } = require('../middlewares/auth');

router.get('/revenue', protect, admin, getRevenueReport);
router.get('/orders', protect, admin, getOrderStats);
router.get('/waiters', protect, admin, getWaiterPerformance);
router.get('/top-products', protect, admin, getTopProducts);

module.exports = router;

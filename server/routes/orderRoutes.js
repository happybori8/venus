const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  payOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
// 전체 주문은 '/:id' 보다 먼저 등록 (GET /api/orders)
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;

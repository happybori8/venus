const Order = require('../models/Order');

// @desc    주문 생성
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: '주문 상품이 없습니다' });
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice >= 50000 ? 0 : 3000;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    내 주문 목록 조회
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    주문 단건 조회
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    전체 주문 목록 (관리자)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    주문 상태 변경 (관리자)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const patch = { status };
    if (status === '배송완료') {
      patch.isDelivered = true;
      patch.deliveredAt = Date.now();
    }
    if (status === '결제완료') {
      patch.isPaid = true;
      patch.paidAt = new Date();
    }
    const order = await Order.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

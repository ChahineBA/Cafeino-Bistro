const Order = require('../models/Order');
const crypto = require('crypto');

const generateOrderNumber = () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${randomStr}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { items, notes } = req.body;

  if (items && items.length === 0) {
    return res.status(400).json({ detail: 'No order items' });
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  const order = new Order({
    order_number: generateOrderNumber(),
    items,
    total,
    status: 'pending',
    waiter_id: req.user._id.toString(),
    waiter_name: req.user.full_name,
    notes,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
// @desc    Get orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  const statusFilter = req.query.status || req.query.status_filter;
  const showAll = req.query.all === 'true' || req.query.today_only !== 'true';
  
  const query = {};
  
  // Waiters only see their own orders
  if (req.user.role !== 'admin') {
    // Support both ObjectId and string waiter_id
    query.$or = [
      { waiter_id: req.user._id },
      { waiter_id: req.user._id.toString() }
    ];
  }
  
  // Status filter
  if (statusFilter) {
    query.status = statusFilter;
  }

  // Today's orders filter (only if explicitly requested)
  if (req.query.today_only === 'true') {
    const now = new Date();
    const todayStart = new Date();
    if (now.getHours() < 5) {
      todayStart.setDate(todayStart.getDate() - 1);
    }
    todayStart.setHours(5, 0, 0, 0);
    
    // Check both created_at and createdAt for compatibility
    const dateFilter = { $gte: todayStart };
    if (query.$or) {
      // If we already have $or for waiter_id, we need to wrap the whole thing
      const waiterQuery = { $or: query.$or };
      delete query.$or;
      query.$and = [
        waiterQuery,
        { $or: [ { created_at: dateFilter }, { createdAt: dateFilter } ] }
      ];
    } else {
      query.$or = [ { created_at: dateFilter }, { createdAt: dateFilter } ];
    }
  }

  try {
    const orders = await Order.find(query).sort({ created_at: -1, createdAt: -1 });
    console.log(`[Orders] Found ${orders.length} orders for ${req.user.full_name} (Role: ${req.user.role})`);
    res.json(orders);
  } catch (error) {
    console.error(`[Orders] Error fetching orders: ${error.message}`);
    res.status(500).json({ detail: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (req.user.role !== 'admin' && order.waiter_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'Not authorized to view this order' });
    }
    res.json(order);
  } else {
    res.status(404).json({ detail: 'Order not found' });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  const { items, total, status, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (order) {
    if (req.user.role !== 'admin' && order.waiter_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'Not authorized to update this order' });
    }

    order.items = items || order.items;
    order.total = total !== undefined ? total : order.total;
    order.status = status || order.status;
    order.notes = notes || order.notes;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ detail: 'Order not found' });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (req.user.role !== 'admin' && order.waiter_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'Not authorized to cancel this order' });
    }

    order.status = 'cancelled';
    await order.save();
    res.status(204).json({ message: 'Order cancelled' });
  } else {
    res.status(404).json({ detail: 'Order not found' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
};

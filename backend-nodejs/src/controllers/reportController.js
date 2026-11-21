const Order = require('../models/Order');
const ServiceRecord = require('../models/ServiceRecord');

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ detail: 'Start date and end date are required' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    created_at: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' },
  });

  const dailyRevenue = {};
  let totalRevenue = 0;

  orders.forEach(order => {
    const dateStr = order.created_at.toISOString().split('T')[0];
    if (!dailyRevenue[dateStr]) {
      dailyRevenue[dateStr] = { revenue: 0, count: 0 };
    }
    dailyRevenue[dateStr].revenue += order.total;
    dailyRevenue[dateStr].count += 1;
    totalRevenue += order.total;
  });

  const dailyData = [];
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    dailyData.push({
      date: dateStr,
      total_revenue: dailyRevenue[dateStr] ? dailyRevenue[dateStr].revenue : 0,
      order_count: dailyRevenue[dateStr] ? dailyRevenue[dateStr].count : 0,
    });
    current.setDate(current.getDate() + 1);
  }

  res.json({
    start_date,
    end_date,
    total_revenue: totalRevenue,
    total_orders: orders.length,
    daily_data: dailyData,
  });
};

// @desc    Get order stats
// @route   GET /api/reports/orders
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ detail: 'Date is required' });
  }

  const targetDate = new Date(date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const orders = await Order.find({
    created_at: { $gte: targetDate, $lt: nextDay },
  });

  const stats = {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'pending').length,
    completed_orders: orders.filter(o => o.status === 'completed').length,
    cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
    total_revenue: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0),
  };

  res.json(stats);
};

// @desc    Get waiter performance
// @route   GET /api/reports/waiters
// @access  Private/Admin
const getWaiterPerformance = async (req, res) => {
  const { start_date, end_date } = req.query;

  const start = new Date(start_date);
  const end = new Date(end_date);
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    created_at: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' },
  });

  const dateList = [];
  let current = new Date(start);
  while (current <= end) {
    dateList.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  const services = await ServiceRecord.find({
    date: { $in: dateList },
  });

  const waiterStats = {};

  orders.forEach(order => {
    const waiterId = order.waiter_id.toString();
    if (!waiterStats[waiterId]) {
      waiterStats[waiterId] = { name: order.waiter_name, orders: 0, revenue: 0, hours: 0 };
    }
    waiterStats[waiterId].orders += 1;
    waiterStats[waiterId].revenue += order.total;
  });

  services.forEach(service => {
    const waiterId = service.waiter_id.toString();
    if (!waiterStats[waiterId]) {
      waiterStats[waiterId] = { name: service.waiter_name, orders: 0, revenue: 0, hours: 0 };
    }
    if (service.duration_minutes) {
      waiterStats[waiterId].hours += service.duration_minutes / 60;
    }
  });

  const performanceList = Object.keys(waiterStats).map(id => ({
    waiter_id: id,
    waiter_name: waiterStats[id].name,
    total_orders: waiterStats[id].orders,
    total_revenue: waiterStats[id].revenue,
    total_hours_worked: Math.round(waiterStats[id].hours * 100) / 100,
  }));

  performanceList.sort((a, b) => b.total_revenue - a.total_revenue);

  res.json(performanceList);
};

// @desc    Get top products
// @route   GET /api/reports/top-products
// @access  Private/Admin
const getTopProducts = async (req, res) => {
  const { start_date, end_date, limit = 10 } = req.query;

  const start = new Date(start_date);
  const end = new Date(end_date);
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    created_at: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' },
  });

  const productStats = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      productStats[productId].quantity += item.quantity;
      productStats[productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.keys(productStats).map(id => ({
    product_id: id,
    product_name: productStats[id].name,
    quantity_sold: productStats[id].quantity,
    revenue: productStats[id].revenue,
  }));

  topProducts.sort((a, b) => b.quantity_sold - a.quantity_sold);

  res.json(topProducts.slice(0, limit));
};

module.exports = {
  getRevenueReport,
  getOrderStats,
  getWaiterPerformance,
  getTopProducts,
};

"use client";

import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, TrendingUp, ShoppingCart, DollarSign, Package, Clock, Download, FileSpreadsheet, Award, Zap } from 'lucide-react';

export default function TodayStatsPage() {
  const { data: orders = [], isLoading } = useOrders();

  // Filter today's orders (resets at 5 AM)
  const todayOrders = useMemo(() => {
    const now = new Date();
    
    // If current time is before 5 AM, use yesterday's date
    let businessDay = new Date(now);
    if (now.getHours() < 5) {
      businessDay.setDate(businessDay.getDate() - 1);
    }
    
    const businessDayString = businessDay.toDateString();
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      
      // Adjust order date if it was created before 5 AM
      let orderBusinessDay = new Date(orderDate);
      if (orderDate.getHours() < 5) {
        orderBusinessDay.setDate(orderBusinessDay.getDate() - 1);
      }
      
      return orderBusinessDay.toDateString() === businessDayString;
    });
  }, [orders]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = todayOrders.filter(o => o.status === 'completed');
    const pending = todayOrders.filter(o => o.status === 'pending');
    const cancelled = todayOrders.filter(o => o.status === 'cancelled');
    const revenue = completed.reduce((sum, order) => sum + order.total, 0);
    const avgOrder = completed.length > 0 ? revenue / completed.length : 0;

    return {
      totalOrders: todayOrders.length,
      completed: completed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      avgOrder
    };
  }, [todayOrders]);

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Order #', 'Time', 'Waiter', 'Items', 'Total (TND)', 'Status', 'Notes'];
    const rows = todayOrders.map(order => [
      order.order_number,
      format(new Date(order.created_at), 'HH:mm:ss'),
      order.waiter_name,
      order.items.length,
      order.total.toFixed(2),
      order.status,
      order.notes || ''
    ]);

    // Calculate totals
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = todayOrders.reduce((sum, order) => sum + order.items.length, 0);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Add empty line
    csvContent += '\n';
    
    // Add totals row
    csvContent += `"","","TOTAL","${totalItems}","${totalRevenue.toFixed(2)}","",""\n`;
    
    // Add summary section
    csvContent += '\n';
    csvContent += '"SUMMARY"\n';
    csvContent += `"Total Orders","${todayOrders.length}"\n`;
    csvContent += `"Completed","${stats.completed}"\n`;
    csvContent += `"Pending","${stats.pending}"\n`;
    csvContent += `"Cancelled","${stats.cancelled}"\n`;
    csvContent += `"Total Revenue","${totalRevenue.toFixed(2)} TND"\n`;
    csvContent += `"Average Order","${stats.avgOrder.toFixed(2)} TND"\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cafeino-today-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    {
      label: "Today's Revenue",
      value: `${stats.revenue.toFixed(2)} TND`,
      icon: DollarSign,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: `${stats.completed} completed`
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: `${stats.pending} pending`
    },
    {
      label: 'Average Order',
      value: `${stats.avgOrder.toFixed(2)} TND`,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: `${stats.cancelled} cancelled`
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Today&apos;s Statistics 📊</h1>
          <p className="text-[#6B6B63] text-lg">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToExcel}
          disabled={todayOrders.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-xl shadow-green-500/30 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </motion.button>
      </motion.div>

      {/* Date Display Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#C17817] via-[#D4A574] to-[#E8B86D] rounded-2xl shadow-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30"
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Today&apos;s Report</h2>
              <p className="text-white/80 text-sm">Real-time business insights</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-5xl font-bold text-white font-mono">
              {format(new Date(), 'HH:mm')}
            </div>
            <div className="text-white/80 text-sm font-medium mt-1">
              Live Updates
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
            <div className="relative p-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-xl mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <p className="text-sm font-medium text-[#6B6B63] mb-1">{stat.label}</p>
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-4xl font-bold text-[#1A1614]"
              >
                {stat.value}
              </motion.p>
              <p className="text-xs font-semibold text-[#6B6B63] mt-2">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1A1614] flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            Today&apos;s Orders
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B6B63]">Total:</span>
            <span className="text-2xl font-bold gradient-text">{todayOrders.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : todayOrders.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-[#D1D1CC]" />
            </motion.div>
            <p className="text-xl font-bold text-[#6B6B63] mb-2">No orders today yet</p>
            <p className="text-[#A8A8A0]">Orders will appear here as they come in</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.03 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg shadow-md">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono font-bold text-[#C17817] text-lg">#{order.order_number}</p>
                        <span className={`badge badge-${
                          order.status === 'pending' ? 'warning' :
                          order.status === 'completed' ? 'success' : 'error'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6B6B63]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(order.created_at), 'h:mm a')}
                        </span>
                        <span>{order.waiter_name}</span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">
                      {order.total.toFixed(2)} TND
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Hourly Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#1A1614] mb-4 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Quick Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <span className="text-sm font-semibold text-[#1A1614]">Completion Rate</span>
              <span className="text-lg font-bold text-green-600">
                {todayOrders.length > 0 ? ((stats.completed / todayOrders.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <span className="text-sm font-semibold text-[#1A1614]">Peak Hour</span>
              <span className="text-lg font-bold text-blue-600">
                {todayOrders.length > 0 ? format(new Date(todayOrders[0].created_at), 'h a') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <span className="text-sm font-semibold text-[#1A1614]">Items Sold</span>
              <span className="text-lg font-bold text-purple-600">
                {todayOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#1A1614] mb-4 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            Status Breakdown
          </h3>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1A1614]">Completed</span>
                <span className="text-lg font-bold text-green-600">{stats.completed}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todayOrders.length > 0 ? (stats.completed / todayOrders.length) * 100 : 0}%` }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1A1614]">Pending</span>
                <span className="text-lg font-bold text-orange-600">{stats.pending}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todayOrders.length > 0 ? (stats.pending / todayOrders.length) * 100 : 0}%` }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1A1614]">Cancelled</span>
                <span className="text-lg font-bold text-red-600">{stats.cancelled}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todayOrders.length > 0 ? (stats.cancelled / todayOrders.length) * 100 : 0}%` }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

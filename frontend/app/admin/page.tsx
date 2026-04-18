"use client";

import { useOrders } from '@/hooks/useOrders';
import { useRevenueReport } from '@/hooks/useReports';
import { DollarSign, ShoppingCart, TrendingUp, Users, Award, Zap, Target, Crown, Package, BarChart3, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  
  const { data: orders = [] } = useOrders();
  const { data: revenueReport } = useRevenueReport(sevenDaysAgo, today);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === new Date().toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  const activeWaiters = new Set(orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === new Date().toDateString();
  }).map(o => o.waiter_id)).size;

  const stats = [
    { 
      label: "Today's Revenue", 
      value: `${todayRevenue.toFixed(2)} TND`, 
      icon: DollarSign, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: '+12.5%',
      changePositive: true
    },
    { 
      label: "Today's Orders", 
      value: todayOrders.length, 
      icon: ShoppingCart, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+8.2%',
      changePositive: true
    },
    { 
      label: 'Weekly Revenue', 
      value: `${(revenueReport?.total_revenue || 0).toFixed(2)} TND`, 
      icon: TrendingUp, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: '+15.3%',
      changePositive: true
    },
    { 
      label: 'Active Staff', 
      value: activeWaiters, 
      icon: Users, 
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: `${activeWaiters} online`,
      changePositive: true
    },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Package, gradient: 'from-purple-500 to-purple-600', href: '/admin/products' },
    { label: 'View Reports', icon: BarChart3, gradient: 'from-blue-500 to-blue-600', href: '/admin/reports' },
    { label: 'Manage Staff', icon: Users, gradient: 'from-orange-500 to-orange-600', href: '/admin/waiters' },
  ];

  return (
    <div className="space-y-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#e5e5e5] shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">
                    Admin Dashboard 👑
                  </h1>
                  <p className="text-[#6B6B63] text-lg">
                    Complete overview of your bistro&apos;s performance
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="hidden md:block"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-2xl">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                
                <div className="relative p-6">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-xl`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                    />
                  </div>
                  
                  {/* Value */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#6B6B63]">{stat.label}</p>
                    <motion.p 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="text-3xl font-bold text-[#1A1614]"
                    >
                      {stat.value}
                    </motion.p>
                    <p className={`text-xs font-semibold ${stat.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {quickActions.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${action.gradient} text-white cursor-pointer group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{action.label}</h3>
                    <p className="text-sm opacity-90">Quick access</p>
                  </div>
                  <motion.div
                    animate={{ 
                      x: [0, 5, 0],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <action.icon className="w-10 h-10" />
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Revenue Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueReport?.daily_data || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C17817" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C17817" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B6B63"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#6B6B63"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '2px solid #E8E8E5',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} TND`, 'Revenue']}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke="#C17817" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#C17817', r: 6, strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Orders & Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                Recent Orders
              </h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.05 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-mono font-bold text-[#C17817] text-lg">#{order.order_number}</p>
                        <p className="text-sm text-[#6B6B63]">
                          {order.waiter_name} • {format(new Date(order.created_at), 'h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold gradient-text">{order.total.toFixed(2)} TND</p>
                        <span className={`badge badge-${
                          order.status === 'pending' ? 'warning' :
                          order.status === 'completed' ? 'success' : 'error'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Performance Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                Performance Highlights
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Average Order Value', value: `${(todayRevenue / (todayOrders.length || 1)).toFixed(2)} TND`, icon: Target, color: 'from-blue-500 to-blue-600' },
                  { label: 'Orders Per Hour', value: Math.round(todayOrders.length / 8), icon: Zap, color: 'from-orange-500 to-orange-600' },
                  { label: 'Top Performer', value: 'John Doe', icon: Award, color: 'from-purple-500 to-purple-600' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`p-3 bg-gradient-to-br ${item.color} rounded-lg shadow-lg`}
                      >
                        <item.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm text-[#6B6B63] font-medium">{item.label}</p>
                        <motion.p 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                          className="text-2xl font-bold text-[#1A1614]"
                        >
                          {item.value}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
    </div>
  );
}

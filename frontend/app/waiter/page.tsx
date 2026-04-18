"use client";

import { useOrders } from '@/hooks/useOrders';
import { useActiveService } from '@/hooks/useServices';
import { ShoppingCart, Clock, Package, TrendingUp, Zap, Coffee, Award, Calendar, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

export default function WaiterDashboard() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: activeService } = useActiveService();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Memoize today's orders filtering (resets at 5 AM)
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

  // Memoize calculated values
  const { activeOrders, completedToday, todayRevenue } = useMemo(() => {
    const active = todayOrders.filter(order => order.status === 'pending');
    const completed = todayOrders.filter(order => order.status === 'completed');
    const revenue = completed.reduce((sum, order) => sum + order.total, 0);
    return { activeOrders: active, completedToday: completed, todayRevenue: revenue };
  }, [todayOrders]);

  // Determine if it's morning, afternoon, or evening
  const hour = currentTime.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const TimeIcon = hour < 18 ? Sun : Moon;

  const stats = useMemo(() => [
    { 
      label: 'Active Orders', 
      value: activeOrders.length, 
      icon: ShoppingCart, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: `${activeOrders.length} pending`,
      changeColor: 'text-blue-600'
    },
    { 
      label: "Today's Orders", 
      value: todayOrders.length, 
      icon: Package, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: `${completedToday.length} completed`,
      changeColor: 'text-purple-600'
    },
    { 
      label: 'Revenue Today', 
      value: `${todayRevenue.toFixed(2)} TND`, 
      icon: TrendingUp, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: `${todayOrders.length} orders`,
      changeColor: 'text-green-600'
    },
    { 
      label: 'Shift Status', 
      value: activeService?.is_active ? 'Active' : 'Inactive', 
      icon: Clock, 
      gradient: activeService?.is_active ? 'from-orange-500 to-orange-600' : 'from-gray-400 to-gray-500',
      bgGradient: activeService?.is_active ? 'from-orange-50 to-orange-100' : 'from-gray-50 to-gray-100',
      change: activeService?.is_active ? 'Clocked in' : 'Not working',
      changeColor: activeService?.is_active ? 'text-orange-600' : 'text-gray-600'
    },
  ], [activeOrders.length, todayOrders.length, completedToday.length, todayRevenue, activeService?.is_active]);

  return (
    <div className="space-y-8">
      {/* Date & Time Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[#C17817] via-[#D4A574] to-[#E8B86D] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30"
              >
                <TimeIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="w-5 h-5 text-white/90" />
                  <h2 className="text-2xl font-bold text-white">
                    {format(currentTime, 'EEEE, MMMM d, yyyy')}
                  </h2>
                </div>
                <p className="text-white/80 text-sm font-medium">
                  Good {timeOfDay}! Have a productive shift ☕
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-right"
              >
                <div className="text-5xl font-bold text-white font-mono tracking-tight">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-white/80 text-sm font-medium mt-1">
                  {format(currentTime, 'a')}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#e5e5e5] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Today&apos;s Dashboard ☕
              </h1>
              <p className="text-[#6B6B63] text-lg">
                Showing only today&apos;s orders and activities
              </p>
            </div>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden md:block"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-2xl flex items-center justify-center shadow-xl">
                <Coffee className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
            
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                />
              </div>
              
              {/* Value */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#6B6B63]">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1A1614]">{stat.value}</p>
                <p className={`text-xs font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.a
          href="/waiter/orders/new"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-[#C17817] to-[#E8B86D] text-white cursor-pointer group shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">New Order</h3>
              <p className="text-sm opacity-90">Create a fresh order</p>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-8 h-8" />
            </motion.div>
          </div>
        </motion.a>

        <motion.a
          href="/waiter/orders"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-[#7C9885] to-[#9FB5A8] text-white cursor-pointer group shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">View Orders</h3>
              <p className="text-sm opacity-90">Manage all orders</p>
            </div>
            <ShoppingCart className="w-8 h-8" />
          </div>
        </motion.a>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Performance</h3>
              <p className="text-sm opacity-90">Top performer today!</p>
            </div>
            <Award className="w-8 h-8" />
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1614]">Today&apos;s Orders</h2>
            <p className="text-sm text-[#6B6B63] mt-1">
              {format(currentTime, 'MMMM d, yyyy')} • {todayOrders.length} order{todayOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <a href="/waiter/orders" className="text-sm font-semibold text-[#C17817] hover:text-[#8B5A13] transition-colors">
            View All →
          </a>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : todayOrders.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#D1D1CC]" />
            </motion.div>
            <p className="text-lg font-medium text-[#6B6B63] mb-2">No orders today yet</p>
            <p className="text-sm text-[#A8A8A0]">Create your first order to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="glass rounded-xl p-4 border border-white/20 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-[#C17817] text-lg">
                        #{order.order_number}
                      </span>
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-warning' :
                        order.status === 'completed' ? 'badge-success' :
                        'badge-error'
                      }`}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 bg-orange-500 rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6B6B63]">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items.length} items
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(order.created_at), 'h:mm a')}
                      </span>
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
    </div>
  );
}

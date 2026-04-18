"use client";

import { useState } from 'react';
import { useRevenueReport, useWaiterPerformance, useTopProducts } from '@/hooks/useReports';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, TrendingUp, Award, DollarSign, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomDatePicker from '@/components/CustomDatePicker';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(subDays(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());

  const { data: revenueReport } = useRevenueReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
  const { data: waiterPerformance = [] } = useWaiterPerformance(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
  const { data: topProducts = [] } = useTopProducts(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), 5);

  const COLORS = ['#C17817', '#7C9885', '#E8B86D', '#8B5A13', '#9FB5A8'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Reports & Analytics 📊</h1>
        <p className="text-[#6B6B63]">Detailed insights into your business performance</p>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border-2 border-white/30"
          >
            <Calendar className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-white">Date Range</p>
            <p className="text-xs text-white/80">Select period for analysis</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">Start Date</label>
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">End Date</label>
            <CustomDatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          { 
            label: 'Total Revenue', 
            value: `${(revenueReport?.total_revenue || 0).toFixed(2)} TND`,
            icon: DollarSign,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100'
          },
          { 
            label: 'Total Orders', 
            value: revenueReport?.total_orders || 0,
            icon: Target,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100'
          },
          { 
            label: 'Average Order', 
            value: `${revenueReport?.total_orders ? (revenueReport.total_revenue / revenueReport.total_orders).toFixed(2) : '0.00'} TND`,
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100'
          },
        ].map((stat, index) => (
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
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Daily Revenue
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={revenueReport?.daily_data || []}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C17817" />
                <stop offset="100%" stopColor="#E8B86D" />
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
            <Bar 
              dataKey="total_revenue" 
              fill="url(#barGradient)" 
              radius={[12, 12, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Performance & Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Waiter Performance */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            Staff Performance
          </h2>
          <div className="space-y-3">
            {waiterPerformance.map((waiter, index) => (
              <motion.div
                key={waiter.waiter_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg"
                  >
                    {index + 1}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1614]">{waiter.waiter_name}</p>
                    <p className="text-sm text-[#6B6B63]">
                      {waiter.total_orders} orders • {waiter.total_hours_worked.toFixed(1)}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold gradient-text">
                      {waiter.total_revenue.toFixed(2)} TND
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Top Selling Products
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ x: -4, scale: 1.02 }}
                className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                    }}
                  >
                    {index + 1}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1614]">{product.product_name}</p>
                    <p className="text-sm text-[#6B6B63]">{product.quantity_sold} sold</p>
                  </div>
                  <p className="text-xl font-bold gradient-text">
                    {product.revenue.toFixed(2)} TND
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

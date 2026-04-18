"use client";

import { useState, useMemo, useEffect } from 'react';
import { useOrders, useUpdateOrder } from '@/hooks/useOrders';
import { ShoppingCart, Search, CheckCircle, XCircle, Package, ChevronDown, Coffee, Edit, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<'completed' | 'cancelled' | null>(null);
  const [printedOrders, setPrintedOrders] = useState<Set<string>>(new Set());
  const { data: orders = [], isLoading } = useOrders(statusFilter);
  const updateOrder = useUpdateOrder();

  // Load printed orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('printedOrders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrintedOrders(new Set(parsed));
      } catch (error) {
        console.error('Error loading printed orders:', error);
      }
    }
  }, []);

  // Save printed orders to localStorage whenever it changes
  useEffect(() => {
    if (printedOrders.size > 0) {
      localStorage.setItem('printedOrders', JSON.stringify(Array.from(printedOrders)));
    }
  }, [printedOrders]);

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

  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return todayOrders.filter(order =>
      order.order_number.toLowerCase().includes(searchLower) ||
      order.waiter_name.toLowerCase().includes(searchLower)
    );
  }, [todayOrders, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      await updateOrder.mutateAsync({ id: orderId, data: { status: newStatus } });
      
      // Show success animation
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        setShowSuccessAnimation(newStatus);
        setTimeout(() => {
          setShowSuccessAnimation(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleEditOrderProducts = (order: any) => {
    // Store order data in localStorage to pre-fill cart
    const orderData = {
      orderId: order._id,
      orderNumber: order.order_number,
      items: order.items,
      notes: order.notes || ''
    };
    localStorage.setItem('editingOrder', JSON.stringify(orderData));
    window.location.href = '/waiter/orders/new';
  };

  const printReceipt = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print the receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt { width: 100%; }
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          .logo-image {
            width: 60mm;
            height: auto;
            max-height: 25mm;
            margin: 0 auto 8px;
            display: block;
            object-fit: contain;
          }
          .tagline {
            font-size: 10px;
            font-style: italic;
            margin-bottom: 5px;
          }
          .contact-info {
            font-size: 9px;
            margin-top: 5px;
          }
          .divider-thick {
            border-top: 2px solid #000;
            margin: 10px 0;
          }
          .order-info {
            margin-bottom: 10px;
            font-size: 11px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .info-label { font-weight: bold; }
          .items-section { margin: 10px 0; }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid #000;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .notes-section {
            margin: 10px 0;
            padding: 8px;
            border: 1px dashed #000;
            font-size: 10px;
          }
          .notes-label {
            font-weight: bold;
            margin-bottom: 3px;
          }
          .total-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
          }
          .message-section {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          .thank-you {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .customer-message {
            font-style: italic;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          @media print {
            body { width: 80mm; margin: 0; padding: 5px; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo-container">
              <img src="${window.location.origin}/logo.png" alt="Cafeino Bistro" class="logo-image" />
              <div class="tagline">"Where Every Cup Tells a Story"</div>
            </div>
            <div class="contact-info">
              Tel: (555) 123-4567<br>
              www.cafeinobistro.com
            </div>
          </div>

          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Order #:</span>
              <span>${order.order_number}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${format(new Date(order.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span>${format(new Date(order.created_at), 'h:mm a')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span>${order.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="divider-thick"></div>

          <div class="items-section">
            <div class="items-header">
              <span style="flex: 1;">ITEM</span>
              <span style="width: 30px; text-align: center;">QTY</span>
              <span style="width: 60px; text-align: right;">PRICE</span>
            </div>
            ${order.items.map((item: any) => `
              <div class="item-row">
                <div style="flex: 1;">${item.product_name}</div>
                <div style="width: 30px; text-align: center;">${item.quantity}</div>
                <div style="width: 60px; text-align: right;">${item.subtotal.toFixed(2)} TND</div>
              </div>
              <div style="font-size: 9px; color: #666; margin-left: 5px; margin-bottom: 5px;">
                @ ${item.unit_price.toFixed(2)} TND each
              </div>
            `).join('')}
          </div>

          ${order.notes ? `
            <div class="notes-section">
              <div class="notes-label">SPECIAL INSTRUCTIONS:</div>
              <div>${order.notes}</div>
            </div>
          ` : ''}

          <div class="divider-thick"></div>

          <div class="total-section">
            <div class="total-row">
              <span>TOTAL:</span>
              <span>${order.total.toFixed(2)} TND</span>
            </div>
          </div>

          <div class="message-section">
            <div class="thank-you">★ THANK YOU! ★</div>
            <div class="customer-message">
              Your satisfaction is our priority!<br>
              We hope you enjoyed your experience.<br>
              Please visit us again soon!
            </div>
            <div style="margin-top: 8px; font-size: 9px;">
              Follow us on social media<br>
              @cafeinobistro
            </div>
            <div style="margin-top: 10px; font-size: 10px;">
              ═══════════════════════
            </div>
            <div style="margin-top: 5px; font-size: 9px;">
              Powered by Cafeino POS System
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
              window.addEventListener('afterprint', function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              });
            }, 300);
          });
        </script>
      </body>
      </html>
    `;

    try {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Mark order as printed
      setPrintedOrders(prev => new Set(prev).add(order._id));
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Error printing receipt. Please try again.');
      printWindow.close();
    }
  };

  const statusOptions = [
    { value: '', label: 'All Orders', color: 'from-gray-500 to-gray-600' },
    { value: 'pending', label: 'Pending', color: 'from-orange-500 to-orange-600' },
    { value: 'completed', label: 'Completed', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Today's Orders</h1>
          <p className="text-[#6B6B63]">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Manage today's orders
          </p>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="bg-white px-6 py-3 rounded-xl border border-[#e5e5e5] shadow-lg"
        >
          <div className="text-center">
            <p className="text-sm text-[#6B6B63]">Today's Orders</p>
            <p className="text-3xl font-bold gradient-text">{todayOrders.length}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number or waiter..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  statusFilter === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : 'bg-white text-[#6B6B63] hover:bg-[#F5F5F3]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-[#D1D1CC]" />
          </motion.div>
          <p className="text-xl font-bold text-[#6B6B63] mb-2">No orders today</p>
          <p className="text-[#A8A8A0]">Try adjusting your filters or create a new order for today</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden group border border-[#f0f0f0]"
            >
              {/* Order Header */}
              <div
                className={`p-6 cursor-pointer hover:bg-[#fafafa] transition-colors rounded-t-3xl ${
                  printedOrders.has(order._id) 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500' 
                    : 'bg-white'
                }`}
              >
                {/* Notes Banner */}
                {order.notes && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg"
                  >
                    <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span className="font-bold">Note:</span> {order.notes}
                    </p>
                  </motion.div>
                )}
                
                <div 
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg shadow-md ${
                        printedOrders.has(order._id)
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-[#c8956e] to-[#d4a574]'
                      }`}>
                        {printedOrders.has(order._id) ? (
                          <Printer className="w-5 h-5 text-white" />
                        ) : (
                          <Coffee className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-[#1A1614]">
                            #{order.order_number}
                          </h3>
                          {printedOrders.has(order._id) && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                            >
                              PRINTED
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-[#6B6B63]">
                          {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-warning' :
                        order.status === 'completed' ? 'badge-success' :
                        'badge-error'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-[#6B6B63]">{order.items.length} items</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-3xl font-bold text-[#c8956e]">
                        {order.total.toFixed(2)} TND
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-[#A8A8A0]" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              <AnimatePresence>
                {expandedOrder === order._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#E8E8E5] overflow-hidden"
                  >
                    <div className="p-6 bg-[#fafafa] rounded-b-3xl">
                      {/* Order Items */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-[#1A1614]">Order Items</h4>
                          {order.status === 'pending' && !printedOrders.has(order._id) && (
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrderProducts(order);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                              Add/Delete Products
                            </motion.button>
                          )}
                          {printedOrders.has(order._id) && order.status === 'pending' && (
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
                              ✓ Receipt printed - editing disabled
                            </span>
                          )}
                        </div>
                        
                        {order.items.map((item: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex justify-between items-center p-4 bg-white rounded-xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#c8956e] to-[#b8845e] rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold">{item.quantity}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-[#1A1614]">{item.product_name}</p>
                                <p className="text-sm text-[#6B6B63]">
                                  {item.unit_price.toFixed(2)} TND each
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-[#c8956e]">
                              {item.subtotal.toFixed(2)} TND
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Actions */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        {/* Print Receipt Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            printReceipt(order);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl shadow-lg transition-all relative overflow-hidden group ${
                            printedOrders.has(order._id)
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/30'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30'
                          }`}
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Printer className="w-5 h-5 relative z-10" />
                          </motion.div>
                          <span className="relative z-10">
                            {printedOrders.has(order._id) ? 'Print Again' : 'Print Receipt'}
                          </span>
                        </motion.button>

                        {/* Status Actions for Pending Orders */}
                        {order.status === 'pending' && (
                          <motion.button
                            whileHover={{ 
                              scale: 1.05, 
                              y: -3,
                              boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.3), 0 10px 10px -5px rgba(34, 197, 94, 0.2)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusChange(order._id, 'completed')}
                            disabled={updateOrder.isPending}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <CheckCircle className="w-5 h-5 relative z-10" />
                            </motion.div>
                            <span className="relative z-10">Mark Complete</span>
                          </motion.button>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Success Animation - Completed */}
      <AnimatePresence>
        {showSuccessAnimation === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-500/95 via-green-600/95 to-emerald-600/95 backdrop-blur-sm"
          >
            <div className="text-center flex flex-col items-center">
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  duration: 0.6 
                }}
                className="relative mb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mx-auto"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                
                {/* Success particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 45) * Math.PI / 180) * 80,
                      y: Math.sin((i * 45) * Math.PI / 180) * 80,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 1,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white"
                  />
                ))}
              </motion.div>

              {/* Success Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-5xl font-bold text-white mb-4"
                >
                  Order Completed! ✓
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl text-white/90"
                >
                  Order has been marked as complete
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

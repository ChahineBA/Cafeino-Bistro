"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder, useUpdateOrder } from '@/hooks/useOrders';
import { OrderItem } from '@/types';
import { Plus, Minus, ShoppingCart, Trash2, Coffee, Check, X, FileText, Croissant, Wine, IceCream, Salad, Cake, UtensilsCrossed, Egg, CupSoda, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewOrderPage() {
  const router = useRouter();
  const { data: products = [], isLoading } = useProducts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [totalAnimation, setTotalAnimation] = useState<'green' | 'red' | 'normal'>('normal');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderNumber, setEditingOrderNumber] = useState<string | null>(null);

  // Load cart from localStorage if editing an existing order
  useEffect(() => {
    const editingOrderData = localStorage.getItem('editingOrder');
    if (editingOrderData) {
      try {
        const data = JSON.parse(editingOrderData);
        setEditingOrderId(data.orderId);
        setEditingOrderNumber(data.orderNumber);
        setCart(data.items);
        setNotes(data.notes);
        localStorage.removeItem('editingOrder');
      } catch (error) {
        console.error('Error loading editing order:', error);
      }
    }
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : [];

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Category icons, colors, and images for visual distinction
  const categoryConfig: Record<string, { icon: any; gradient: string; bgGradient: string; emoji: string; bgImage: string }> = {
    'petit dejeuner': { 
      icon: Egg, 
      gradient: 'from-amber-600 to-orange-700',
      bgGradient: 'from-amber-50 to-orange-100',
      emoji: '🍳',
      bgImage: 'https://img.freepik.com/photos-gratuite/ingredients-alimentaires-delicieux-au-petit-dejeuner-frais-fond-noir-sombre-pret-cuisiner-concept-cuisson-nourriture-saine-maison-espace-copie-toning_1220-1725.jpg?semt=ais_hybrid&w=740&q=80'
    },
    'coffee soft drink': { 
      icon: Coffee, 
      gradient: 'from-brown-600 to-amber-700',
      bgGradient: 'from-brown-50 to-amber-100',
      emoji: '☕',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxMYNAyHL6EpuyUdBUyBdbNItETb4TRL9uxg&s'
    },
    'croissants delices layers': { 
      icon: Croissant, 
      gradient: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-50 to-amber-100',
      emoji: '🥐',
      bgImage: 'https://preview.redd.it/dark-food-photography-really-fascinates-me-achieved-this-v0-401rn4w1kx241.jpg?width=640&crop=smart&auto=webp&s=283260ff3cbcb69781463ea8c947d60e6fc332bb'
    },
    'tea matcha': { 
      icon: CupSoda, 
      gradient: 'from-green-600 to-emerald-700',
      bgGradient: 'from-green-50 to-emerald-100',
      emoji: '🍵',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3DO_oidBvneDIp3NXb2vGKuIJFyyZ--32RA&s'
    },
    'jus naturels cocktails': {
      icon: Wine,
      gradient: 'from-orange-600 to-red-700',
      bgGradient: 'from-orange-50 to-red-100',
      emoji: '🍹',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAd6dP8KU37g-nhvGQEstAFiEc71C1f3aIvg&s'
    },
    'milk shakes frappuccino': { 
      icon: IceCream, 
      gradient: 'from-pink-600 to-rose-700',
      bgGradient: 'from-pink-50 to-rose-100',
      emoji: '🥤',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUupHCWGG1IynXFIMr6JZBSawfZUW4hDdP9A&s'
    },
    'proteino': {
      icon: Dumbbell,
      gradient: 'from-violet-600 to-indigo-700',
      bgGradient: 'from-violet-50 to-indigo-100',
      emoji: '💪',
      // Pre-workout / creatine / protein jars with a shaker. Photo by Alex Saks on Unsplash (Unsplash License)
      bgImage: 'https://images.unsplash.com/photo-1693996045838-980674653385?w=800&q=80'
    },
    'salades omlettes': { 
      icon: Salad, 
      gradient: 'from-lime-600 to-green-700',
      bgGradient: 'from-lime-50 to-green-100',
      emoji: '🥗',
      bgImage: 'https://www.recettesetcabas.com/data/recettes/4131-1-fiche@64E367C5-omelette-menthe-chevre-frais-salade.webp'
    },
    'gaufres': { 
      icon: Cake, 
      gradient: 'from-yellow-600 to-amber-700',
      bgGradient: 'from-yellow-50 to-amber-100',
      emoji: '🧇',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINdzu8ulgvd-TsGvdrWC8OQrTnwkNE4CwMw&s'
    },
    'crepes': { 
      icon: Cake, 
      gradient: 'from-orange-600 to-red-700',
      bgGradient: 'from-orange-50 to-red-100',
      emoji: '🥞',
      bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb0W5zw-mTgGmi3DlsrQwKBf4V71GvE953AQ&s'
    },
    'supplements': { 
      icon: Coffee, 
      gradient: 'from-gray-600 to-slate-700',
      bgGradient: 'from-gray-50 to-slate-100',
      emoji: '➕',
      bgImage: 'https://www.shutterstock.com/image-photo/espresso-pouring-coffee-machine-nozzle-600nw-2705776349.jpg'
    },
  };

  const getCategoryConfig = (category: string) => {
    const lowerCategory = category.toLowerCase();
    return categoryConfig[lowerCategory] || { 
      icon: UtensilsCrossed, 
      gradient: 'from-gray-600 to-slate-700',
      bgGradient: 'from-gray-50 to-slate-100',
      emoji: '🍽️',
      bgImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
    };
  };

  const addToCart = (productId: string, productName: string, price: number) => {
    const existingItem = cart.find(item => item.product_id === productId);
    
    // Trigger green animation
    setTotalAnimation('green');
    setTimeout(() => setTotalAnimation('normal'), 600);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: productId,
        product_name: productName,
        quantity: 1,
        unit_price: price,
        subtotal: price
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    // Trigger animation based on delta
    if (delta > 0) {
      setTotalAnimation('green');
      setTimeout(() => setTotalAnimation('normal'), 600);
    } else {
      setTotalAnimation('red');
      setTimeout(() => setTotalAnimation('normal'), 600);
    }
    
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, subtotal: newQuantity * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    // Trigger red animation
    setTotalAnimation('red');
    setTimeout(() => setTotalAnimation('normal'), 600);
    
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;

    try {
      if (editingOrderId) {
        // Update existing order with new items and total
        await updateOrder.mutateAsync({ 
          id: editingOrderId, 
          data: { 
            items: cart,
            total: total,
            notes: notes || undefined
          } 
        });
        
        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setCart([]);
          setNotes('');
          setEditingOrderId(null);
          setEditingOrderNumber(null);
          router.push('/waiter/orders');
        }, 2500);
      } else {
        // Create new order
        const order = await createOrder.mutateAsync({ items: cart, notes: notes || undefined });
        setLastOrder({ ...order, items: cart, total, notes });
        setShowReceiptModal(true);
      }
    } catch (error) {
      console.error('Error with order:', error);
      alert('Error saving order. Please try again.');
    }
  };

  const generatePDF = () => {
    if (!lastOrder) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to download the receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${lastOrder.order_number || 'N/A'}</title>
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
          .receipt {
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          .logo-container {
            margin-bottom: 8px;
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
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
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
          .info-label {
            font-weight: bold;
          }
          .items-section {
            margin: 10px 0;
          }
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
          .item-name {
            flex: 1;
            padding-right: 5px;
          }
          .item-qty {
            width: 30px;
            text-align: center;
          }
          .item-price {
            width: 60px;
            text-align: right;
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
          .footer-note {
            font-size: 9px;
            margin-top: 8px;
          }
          .social-media {
            font-size: 9px;
            margin-top: 5px;
          }
          @media print {
            body {
              width: 80mm;
              margin: 0;
              padding: 5px;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header with Logo -->
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

          <!-- Order Information -->
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Order #:</span>
              <span>${lastOrder.order_number || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span>PENDING</span>
            </div>
          </div>

          <div class="divider-thick"></div>

          <!-- Items -->
          <div class="items-section">
            <div class="items-header">
              <span style="flex: 1;">ITEM</span>
              <span style="width: 30px; text-align: center;">QTY</span>
              <span style="width: 60px; text-align: right;">PRICE</span>
            </div>
            ${cart.map(item => `
              <div class="item-row">
                <div class="item-name">${item.product_name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">${item.subtotal.toFixed(2)} TND</div>
              </div>
              <div style="font-size: 9px; color: #666; margin-left: 5px; margin-bottom: 5px;">
                @ ${item.unit_price.toFixed(2)} TND each
              </div>
            `).join('')}
          </div>

          ${notes ? `
            <div class="notes-section">
              <div class="notes-label">SPECIAL INSTRUCTIONS:</div>
              <div>${notes}</div>
            </div>
          ` : ''}

          <div class="divider-thick"></div>

          <!-- Total -->
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)} TND</span>
            </div>
          </div>

          <!-- Customer Message -->
          <div class="message-section">
            <div class="thank-you">★ THANK YOU! ★</div>
            <div class="customer-message">
              Your satisfaction is our priority!<br>
              We hope you enjoyed your experience.<br>
              Please visit us again soon!
            </div>
            <div class="footer-note">
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
          // Trigger print dialog after content loads
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
              // Close window after printing or canceling
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
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Error generating receipt. Please try again.');
      printWindow.close();
    }
  };

  const closeModalAndRedirect = () => {
    setShowReceiptModal(false);
    setShowSuccessAnimation(true);
    
    // Hide success animation and redirect after animation completes
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setLastOrder(null);
      setCart([]);
      setNotes('');
      router.push('/waiter/orders');
    }, 2500);
  };


  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Category Selection View */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {editingOrderId ? (
                <>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h1 className="text-5xl font-bold gradient-text">Edit Order #{editingOrderNumber}</h1>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-bold px-3 py-1.5 rounded-full"
                    >
                      EDITING
                    </motion.span>
                  </div>
                  <p className="text-[#6B6B63] text-xl">Add or remove products from this order</p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl font-bold gradient-text mb-3">Create New Order</h1>
                  <p className="text-[#6B6B63] text-xl">Choose a category to start</p>
                </>
              )}
            </motion.div>

            {/* Category Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.map((category, index) => {
                const config = getCategoryConfig(category);
                const Icon = config.icon;
                const categoryProducts = products.filter(p => p.category === category);
                const newItemsCount = categoryProducts.filter(p => p.is_new).length;
                
                return (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCategory(category);
                    }}
                    className="relative rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 text-left overflow-hidden group h-64"
                    style={{
                      backgroundImage: `url(${config.bgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Dark Overlay for text visibility */}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-300" />
                    
                    {/* Gradient Overlay for color accent */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30 group-hover:opacity-40 transition-opacity mix-blend-multiply`} />
                    
                    {/* NEW Items Badge */}
                    {newItemsCount > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-4 right-4 z-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1 border-2 border-white/50"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          ✨
                        </motion.span>
                        {newItemsCount} NEW
                      </motion.div>
                    )}
                    
                    <div className="relative h-full flex flex-col">
                      {/* Arrow - Top Right */}
                      <motion.div
                        animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-0 right-0 z-20"
                      >
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg border-2 border-white/30">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-center">
                        {/* Icon */}
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            y: [0, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl mb-4 relative z-10 border-2 border-white/30"
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>
                        
                        {/* Category Name */}
                        <h3 className="text-3xl font-bold text-white mb-2 relative z-10 drop-shadow-lg">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h3>
                        
                        {/* Item Count */}
                        <p className="text-white/90 text-sm font-semibold relative z-10 drop-shadow-md">
                          {categoryProducts.length} item{categoryProducts.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Products Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header with Back Button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <motion.button
                      whileHover={{ scale: 1.1, x: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedCategory(null)}
                      className="p-3 rounded-xl bg-white hover:bg-[#F5F5F3] border-2 border-[#e5e5e5] transition-all shadow-md"
                    >
                      <svg className="w-6 h-6 text-[#C17817]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    
                    {selectedCategory && (
                      <>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-16 h-16 bg-gradient-to-br ${getCategoryConfig(selectedCategory).gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          {React.createElement(getCategoryConfig(selectedCategory).icon, { className: "w-8 h-8 text-white" })}
                        </motion.div>
                        
                        <div>
                          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                            <span className="text-5xl">{getCategoryConfig(selectedCategory).emoji}</span>
                          </h1>
                          <p className="text-[#6B6B63]">Select products to add to your order</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-48 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {filteredProducts.map((product, index) => {
                    // Use is_new field from backend
                    const isNew = product.is_new || false;
                    const displayName = product.name.replace(/\s*\[NEW\]\s*/gi, '').trim();
                    
                    return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => product.is_available && addToCart(product._id, displayName, product.price)}
                      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 ${
                        product.is_available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      } relative overflow-hidden group`}
                    >
                {/* NEW Badge */}
                {isNew && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-md opacity-60" />
                      <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          ✨
                        </motion.span>
                        NEW
                        <motion.span
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          ✨
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C17817]/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-[#1A1614] mb-2">
                        {displayName}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-[#6B6B63] mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#7C9885]/20 to-[#9FB5A8]/20 text-[#5A7563] text-xs font-semibold rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Coffee className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E8E5]">
                    <span className="text-3xl font-bold gradient-text">
                      {product.price.toFixed(2)} TND
                    </span>
                    {product.is_available ? (
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        className="w-10 h-10 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <span className="badge badge-error">Unavailable</span>
                    )}
                  </div>
                  </div>
                </motion.div>
              );
              })}
            </motion.div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky top-40"
        >
          <div className="bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C17817]/10 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
            
            {/* Cart Header */}
            <div className="relative p-6 pb-4 border-b-2 border-[#E8E8E5] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-xl shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1614]">Cart</h2>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-10 h-10 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {cart.length}
                </motion.div>
              </div>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="relative flex-1 overflow-y-auto p-6 pt-3" style={{ minHeight: '200px' }}>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#D1D1CC]" />
                      </motion.div>
                      <p className="text-[#6B6B63] font-medium">Cart is empty</p>
                      <p className="text-sm text-[#A8A8A0]">Add items to get started</p>
                    </motion.div>
                  ) : (
                    cart.map((item, index) => {
                      const isNew = item.product_name.includes('[NEW]');
                      const displayName = item.product_name.replace(/\s*\[NEW\]\s*/gi, '').trim();
                      
                      return (
                      <motion.div
                        key={item.product_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className="bg-white/95 rounded-xl p-4 border border-[#e5e5e5] group shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-1 pr-2">
                            <p className="font-semibold text-[#1A1614]">
                              {displayName}
                            </p>
                            {isNew && (
                              <motion.span
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                              >
                                NEW
                              </motion.span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product_id, -1)}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-[#F5F5F3] shadow-sm"
                            >
                              <Minus className="w-4 h-4 text-[#C17817]" />
                            </motion.button>
                            <span className="font-bold text-lg w-10 text-center text-[#1A1614]">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product_id, 1)}
                              className="w-8 h-8 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg flex items-center justify-center shadow-lg"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                          <span className="font-bold text-lg text-[#C17817]">
                            {item.subtotal.toFixed(2)} TND
                          </span>
                        </div>
                      </motion.div>
                    );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Notes - Sticky at bottom of scrollable area */}
            <div className="relative p-6 pt-3 border-t-2 border-[#E8E8E5] flex-shrink-0">
              <label className="block text-sm font-semibold text-[#1A1614] mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0] resize-none text-sm"
                placeholder="Special instructions..."
              />
            </div>

            {/* Total & Actions - Always visible at bottom */}
            <div className="relative p-6 pt-4 border-t-2 border-[#E8E8E5] bg-gradient-to-br from-white to-[#fafafa] flex-shrink-0">
              {/* Total */}
              <div className="bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl p-4 mb-4 border-2 border-[#C17817]/30">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-[#1A1614]">Total</span>
                  <motion.span
                    key={total}
                    initial={{ 
                      scale: 1.3,
                      color: totalAnimation === 'green' ? '#22c55e' : 
                             totalAnimation === 'red' ? '#ef4444' : '#C17817'
                    }}
                    animate={{ 
                      scale: 1,
                      color: totalAnimation === 'green' ? '#22c55e' : 
                             totalAnimation === 'red' ? '#ef4444' : '#C17817'
                    }}
                    transition={{ 
                      scale: { duration: 0.3, ease: "easeOut" },
                      color: { duration: 0.6, ease: "easeInOut" }
                    }}
                    className="text-3xl font-bold"
                    style={{ 
                      background: totalAnimation === 'normal' ? 'linear-gradient(135deg, #C17817 0%, #E8B86D 100%)' : 'none',
                      WebkitBackgroundClip: totalAnimation === 'normal' ? 'text' : 'unset',
                      WebkitTextFillColor: totalAnimation === 'normal' ? 'transparent' : 'inherit',
                      backgroundClip: totalAnimation === 'normal' ? 'text' : 'unset'
                    }}
                  >
                    {total.toFixed(2)} TND
                  </motion.span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={cart.length === 0 || createOrder.isPending || updateOrder.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white text-base font-bold rounded-xl shadow-xl shadow-[#C17817]/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group transition-all"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {createOrder.isPending || updateOrder.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Coffee className="w-5 h-5" />
                      </motion.div>
                      {editingOrderId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingOrderId ? 'Update Order' : 'Place Order'}
                    </>
                  )}
                </span>
              </motion.button>

              {/* Clear Cart */}
              {cart.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTotalAnimation('red');
                    setTimeout(() => {
                      setCart([]);
                      setTotalAnimation('normal');
                    }, 300);
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && lastOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModalAndRedirect}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-br from-[#C17817] to-[#E8B86D] p-8 rounded-t-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Order Placed!</h2>
                      <p className="text-white/80">Order #{lastOrder.order_number || 'N/A'}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModalAndRedirect}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                {/* Order Info */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium mb-1">Date</p>
                    <p className="font-bold text-blue-900">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <p className="text-sm text-purple-600 font-medium mb-1">Time</p>
                    <p className="font-bold text-purple-900">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <p className="text-sm text-green-600 font-medium mb-1">Status</p>
                    <p className="font-bold text-green-900">Pending</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#1A1614] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#C17817]" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item, index) => {
                      const displayName = item.product_name.replace(/\s*\[NEW\]\s*/gi, '').trim();
                      return (
                      <motion.div
                        key={item.product_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-[#fafafa] to-white rounded-xl border border-[#e5e5e5]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                            {item.quantity}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1614]">{displayName}</p>
                            <p className="text-sm text-[#6B6B63]">{item.unit_price.toFixed(2)} TND each</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-[#C17817]">{item.subtotal.toFixed(2)} TND</p>
                      </motion.div>
                    );
                    })}
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <p className="text-sm font-bold text-yellow-800 mb-2">Order Notes:</p>
                    <p className="text-yellow-900">{notes}</p>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl p-6 mb-6 border-2 border-[#C17817]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-[#1A1614]">Total Amount</span>
                    <span className="text-4xl font-bold gradient-text">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModalAndRedirect}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="w-5 h-5" />
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-[#C17817]/95 via-[#D4A574]/95 to-[#E8B86D]/95 backdrop-blur-sm"
          >
            <div className="text-center flex flex-col items-center">
              {/* Animated Checkmark Circle */}
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
                    <Check className="w-20 h-20 text-green-500" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                
                {/* Confetti particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 30) * Math.PI / 180) * 100,
                      y: Math.sin((i * 30) * Math.PI / 180) * 100,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 1,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#fbbf24' : '#ef4444'
                    }}
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
                  transition={{ delay: 0.7, duration: 0.5, repeat: 1 }}
                  className="text-5xl font-bold text-white mb-4"
                >
                  {editingOrderId ? 'Order Updated! 🎉' : 'Order Created! 🎉'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl text-white/90 mb-2"
                >
                  {editingOrderId ? 'Your order has been successfully updated' : 'Your order has been successfully placed'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg text-white/80"
                >
                  Redirecting to orders page...
                </motion.p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

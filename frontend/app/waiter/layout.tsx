"use client";

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveService, useClockIn, useClockOut } from '@/hooks/useServices';
import { Home, ShoppingCart, Clock, LogOut, Coffee, User, TrendingUp, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WaiterLayoutContent>{children}</WaiterLayoutContent>
    </ProtectedRoute>
  );
}

function WaiterLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { data: activeService, refetch } = useActiveService();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const [serviceTime, setServiceTime] = useState('00:00:00');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClockInAnimation, setShowClockInAnimation] = useState(false);
  const [showClockOutAnimation, setShowClockOutAnimation] = useState(false);

  useEffect(() => {
    if (activeService?.is_active) {
      const interval = setInterval(() => {
        const start = new Date(activeService.clock_in);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setServiceTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeService]);

  const handleClockToggle = async () => {
    try {
      if (activeService?.is_active) {
        await clockOut.mutateAsync();
        // Show motivational animation for clock out
        setShowClockOutAnimation(true);
        setTimeout(() => {
          setShowClockOutAnimation(false);
        }, 3500);
      } else {
        await clockIn.mutateAsync();
        // Show motivational animation for clock in
        setShowClockInAnimation(true);
        setTimeout(() => {
          setShowClockInAnimation(false);
        }, 3000);
      }
      refetch();
    } catch (error) {
      console.error('Clock toggle error:', error);
    }
  };

  const navItems = [
    { href: '/waiter', icon: Home, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
    { href: '/waiter/orders', icon: ShoppingCart, label: 'Orders', color: 'from-purple-500 to-purple-600' },
    { href: '/waiter/orders/new', icon: Coffee, label: 'New Order', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F5F3] to-[#E8E8E5]">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E8E5] shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C17817] to-[#E8B86D] rounded-xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-xl flex items-center justify-center shadow-lg">
                  <Coffee className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Cafeino Bistro</h1>
                <p className="text-xs text-[#6B6B63]">Barista Portal</p>
              </div>
            </motion.div>

            {/* Center - Clock Status */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center gap-4"
            >
              <button
                onClick={handleClockToggle}
                disabled={clockIn.isPending || clockOut.isPending}
                className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeService?.is_active
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {activeService?.is_active ? (
                    <span className="font-mono">{serviceTime}</span>
                  ) : (
                    <span>Clock In</span>
                  )}
                </div>
                {activeService?.is_active && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
                  />
                )}
              </button>
            </motion.div>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-xl hover:bg-white/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-[#6B6B63]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C9885] to-[#9FB5A8] rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-[#1A1614]">{user?.full_name}</p>
                  <p className="text-xs text-[#6B6B63]">Barista</p>
                </div>
              </div>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className="p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E5] shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-white shadow-lg text-[#1A1614]'
                        : 'text-[#6B6B63] hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C17817] to-[#E8B86D] rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="md:hidden fixed bottom-6 right-6 z-50"
      >
        <Link href="/waiter/orders/new">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full shadow-2xl flex items-center justify-center"
          >
            <Coffee className="w-7 h-7 text-white" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Clock In Motivational Animation */}
      <AnimatePresence>
        {showClockInAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-orange-500/95 via-amber-500/95 to-yellow-500/95 backdrop-blur-sm"
          >
            <div className="text-center max-w-2xl px-8 flex flex-col items-center">
              {/* Animated Sun/Clock Icon */}
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
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl relative mx-auto"
                >
                  {/* Sun rays */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1, 0] }}
                      transition={{
                        delay: 0.3 + (i * 0.05),
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="absolute w-2 h-8 bg-yellow-400 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: 'center',
                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-70px)`
                      }}
                    />
                  ))}
                  
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <Clock className="w-24 h-24 text-orange-500" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
                
                {/* Energy particles */}
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 22.5) * Math.PI / 180) * 120,
                      y: Math.sin((i * 22.5) * Math.PI / 180) * 120,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 1.5,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#fb923c'
                    }}
                  />
                ))}
              </motion.div>

              {/* Motivational Messages */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.h2
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    delay: 0.7, 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="text-6xl font-bold text-white mb-6 drop-shadow-lg"
                >
                  Let&apos;s Brew Success! ☕
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <motion.p
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl text-white font-semibold"
                  >
                    You&apos;re clocked in and ready to shine! ✨
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-xl text-white/90"
                  >
                    Every cup you serve makes someone&apos;s day better
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                    className="flex items-center justify-center gap-3 mt-6"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Coffee className="w-8 h-8 text-white" />
                    </motion.div>
                    <span className="text-2xl font-bold text-white">Have an amazing shift!</span>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Coffee className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 2.5 }}
                className="mt-12 h-2 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ delay: 0.5, duration: 2.5 }}
                  className="h-full bg-white rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clock Out Motivational Animation */}
      <AnimatePresence>
        {showClockOutAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-blue-600/95 backdrop-blur-sm"
          >
            <div className="text-center max-w-2xl px-8 flex flex-col items-center">
              {/* Animated Moon/Star Icon */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
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
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl relative mx-auto"
                >
                  {/* Stars around */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        delay: 0.3 + (i * 0.1),
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="absolute text-4xl"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-90px)`
                      }}
                    >
                      ⭐
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="text-7xl"
                  >
                    🌙
                  </motion.div>
                </motion.div>
                
                {/* Sparkle particles */}
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
                      duration: 1.5,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#818cf8' : '#60a5fa'
                    }}
                  />
                ))}
              </motion.div>

              {/* Congratulatory Messages */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.h2
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    delay: 0.7, 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="text-6xl font-bold text-white mb-6 drop-shadow-lg"
                >
                  Great Work Today! 🌟
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <motion.p
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl text-white font-semibold"
                  >
                    You&apos;ve clocked out - time to relax! 😊
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-xl text-white/90"
                  >
                    You made a difference today with every smile and every cup
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-6"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <p className="text-2xl font-bold text-white">
                      You deserve a rest - see you next time!
                    </p>
                  </motion.div>

                  {/* Achievement badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="flex justify-center gap-4 mt-8"
                  >
                    {['💪', '⭐', '🏆'].map((emoji, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 2 + (i * 0.2),
                          type: "spring",
                          stiffness: 200
                        }}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl cursor-pointer"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 3 }}
                className="mt-12 h-2 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ delay: 0.5, duration: 3 }}
                  className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

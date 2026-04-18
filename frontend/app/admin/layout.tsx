"use client";

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveService, useClockIn, useClockOut } from '@/hooks/useServices';
import { Home, Package, BarChart3, Users, LogOut, Coffee, Crown, Bell, Settings, Calendar, Bot, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard', gradient: 'from-blue-500 to-blue-600' },
    { href: '/admin/today', icon: Calendar, label: 'Today', gradient: 'from-amber-500 to-amber-600' },
    { href: '/admin/products', icon: Package, label: 'Products', gradient: 'from-purple-500 to-purple-600' },
    { href: '/admin/reports', icon: BarChart3, label: 'Analytics', gradient: 'from-green-500 to-green-600' },
    { href: '/admin/waiters', icon: Users, label: 'Staff', gradient: 'from-orange-500 to-orange-600' },
    { href: '/admin/receipt-settings', icon: Receipt, label: 'Receipts', gradient: 'from-teal-500 to-cyan-600' },
    { href: '/admin/chatbot', icon: Bot, label: 'AI Chatbot', gradient: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F5F3] to-[#E8E8E5]">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E8E5] shadow-lg"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] rounded-xl blur-xl opacity-50"
                />
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-xl flex items-center justify-center shadow-xl">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Cafeino Bistro</h1>
                <p className="text-xs text-[#6B6B63] font-semibold">Admin Control Center</p>
              </div>
            </motion.div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-3 rounded-xl hover:bg-white/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-[#6B6B63]" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl hover:bg-white/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-[#6B6B63]" />
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-[#1A1614]">{user?.full_name}</p>
                  <p className="text-xs text-[#6B6B63]">Administrator</p>
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

      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E5] shadow-sm"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-white shadow-lg text-[#1A1614]'
                        : 'text-[#6B6B63] hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full shadow-lg"
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
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

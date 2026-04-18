"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, User, Lock, AlertCircle, Award } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/waiter');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Video with Black Overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/14019845_3840_2160_60fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60" />

      {/* Premium Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1311]/98 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="relative w-56 h-56 mx-auto mb-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full h-full"
                >
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-44 bg-gradient-to-b from-[#3d2e29] to-[#2a1f1d] rounded-b-[3rem] border-[6px] border-[#d4a574] shadow-2xl overflow-hidden">
                    <motion.div
                      animate={{ height: ['25%', '80%', '25%'] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4a3832] via-[#6b5d56] to-[#8B5A13] rounded-b-[3rem]"
                    >
                      <div className="absolute top-3 left-6 w-10 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md" />
                    </motion.div>
                  </div>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 translate-x-6 w-14 h-20 border-[6px] border-[#d4a574] border-l-0 rounded-r-full" />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [-15, -75],
                          opacity: [0, 0.8, 0],
                          scale: [1, 2.5],
                          x: [0, i % 2 === 0 ? 15 : -15]
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          delay: i * 0.7,
                          ease: 'easeOut'
                        }}
                        className="w-5 h-16 bg-gradient-to-t from-[#d4a574]/70 via-[#c8956e]/50 to-transparent rounded-full blur-lg"
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
              <motion.h2
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="font-display text-3xl font-bold text-[#d4a574] mb-3"
              >
                Brewing Your Experience
              </motion.h2>
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                    className="w-3 h-3 bg-[#d4a574] rounded-full"
                    style={{ boxShadow: '0 0 20px rgba(212,165,116,0.5)' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10 w-full max-w-7xl"
      >
        <div className="rounded-[60px] overflow-hidden shadow-2xl" style={{ height: 'min(85vh, 800px)' }}>
          <div className="flex h-full">
            {/* Left Side - Video Only */}
            <div className="w-1/2 relative overflow-hidden">
              {/* Left Side Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/11043540-hd_1080_1916_30fps.mp4" type="video/mp4" />
              </video>
              
              {/* Subtle Dark Overlay for Depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40" />
            </div>

            {/* Right Side - Light Form */}
            <div className="w-1/2 bg-white overflow-y-auto">
              <div className="min-h-full flex items-center justify-center px-6 lg:px-10 xl:px-12 py-6 lg:py-8">
                <div className="w-full max-w-md">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 lg:mb-8"
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-2 lg:mb-3">
                    Hi, Friends
                  </h1>
                  <p className="text-[#6b6b6b] text-sm lg:text-base">
                    Welcome to CAFEINOBISTRO
                  </p>
                </motion.div>

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onSubmit={handleSubmit}
                  className="space-y-3 lg:space-y-4"
                >
                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 lg:py-3 bg-white border-2 border-[#e5e5e5] focus:border-[#c8956e] rounded-2xl transition-all outline-none text-[#1a1a1a] placeholder:text-[#a0a0a0] pr-12 text-sm"
                      placeholder="I"
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-[#c8956e]" />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 lg:py-3 bg-white border-2 border-[#e5e5e5] focus:border-[#c8956e] rounded-2xl transition-all outline-none text-[#1a1a1a] placeholder:text-[#a0a0a0] pr-12 text-sm"
                      placeholder="Password"
                    />
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-[#6b6b6b]" />
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <a href="#" className="text-xs lg:text-sm text-[#c8956e] hover:text-[#b8845e] font-medium transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#a67550] via-[#c8956e] to-[#d4a574] hover:from-[#8B5A13] hover:to-[#b8845e] text-white font-bold py-2.5 lg:py-3 rounded-full transition-all shadow-lg shadow-[#c8956e]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 lg:mt-6 text-sm"
                  >
                    {loading ? "Signing in..." : "Login"}
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </motion.form>

                {/* Demo Credentials */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t-2 border-[#f0f0f0]"
                >
                  <p className="text-xs font-semibold text-[#a0a0a0] mb-3 lg:mb-4 uppercase tracking-wider text-center">
                    Quick Access
                  </p>
                  <div className="space-y-2 lg:space-y-2.5">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setEmail('admin@cafeino.com');
                        setPassword('admin123');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#fafafa] hover:bg-[#f5f5f5] rounded-xl p-2.5 lg:p-3 text-left transition-all border-2 border-[#f0f0f0] hover:border-[#ec4899]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#d4a574] to-[#b8845e] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1a1a1a] text-xs lg:text-sm font-bold">Admin</p>
                          <p className="text-[#6b6b6b] text-[10px] lg:text-xs truncate">admin@cafeino.com</p>
                        </div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => {
                        setEmail('waiter1@cafeino.com');
                        setPassword('waiter123');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#fafafa] hover:bg-[#f5f5f5] rounded-xl p-2.5 lg:p-3 text-left transition-all border-2 border-[#f0f0f0] hover:border-[#7c8e7e]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-[#7c8e7e] to-[#6a7a6c] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Coffee className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1a1a1a] text-xs lg:text-sm font-bold">Barista</p>
                          <p className="text-[#6b6b6b] text-[10px] lg:text-xs truncate">waiter1@cafeino.com</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

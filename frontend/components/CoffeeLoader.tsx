"use client";

import { motion } from 'framer-motion';

export function CoffeeLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAF8] to-[#E8E8E5]">
      <div className="text-center">
        {/* Large Animated Coffee Cup */}
        <div className="relative w-64 h-64 mx-auto mb-12">
          {/* Main Cup Container */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Cup Body */}
            <div className="relative w-48 h-56">
              {/* Cup Outer Shell */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-48 bg-white rounded-b-[3rem] border-[6px] border-[#8B5A13] shadow-2xl overflow-hidden">
                {/* Coffee Liquid Animation */}
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: ['20%', '80%', '20%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6B4423] via-[#8B5A13] to-[#C17817] rounded-b-[3rem]"
                >
                  {/* Coffee Surface Wave */}
                  <motion.div
                    animate={{
                      x: [-20, 20, -20],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#D89B3D] via-[#E8B86D] to-[#D89B3D] opacity-70 blur-sm"
                  />
                  
                  {/* Bubbles */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -40],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeOut'
                      }}
                      className="absolute bottom-4 w-3 h-3 bg-white/30 rounded-full"
                      style={{ left: `${30 + i * 20}%` }}
                    />
                  ))}
                </motion.div>
                
                {/* Shine Effect on Cup */}
                <div className="absolute top-8 left-6 w-8 h-20 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-md" />
              </div>
              
              {/* Cup Handle */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-14 h-20 border-[6px] border-[#8B5A13] border-l-0 rounded-r-full bg-white/10" />
              
              {/* Steam Particles - More Visible */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 0, scale: 1 }}
                    animate={{
                      y: [-10, -70],
                      opacity: [0, 0.8, 0],
                      scale: [1, 2],
                      x: [0, i % 2 === 0 ? 15 : -15]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeOut'
                    }}
                    className="w-4 h-16 bg-gradient-to-t from-[#C17817] via-[#E8B86D]/60 to-transparent rounded-full blur-md"
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Orbiting Coffee Beans */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="absolute w-6 h-6 bg-gradient-to-br from-[#6B4423] to-[#8B5A13] rounded-full shadow-xl"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-100px) translateX(-3px)`
                }}
              >
                {/* Bean Center Line */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-[#4A2F1A] rounded-full rotate-45" />
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold gradient-text">
            {message}
          </h2>
          
          {/* Animated Dots */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-4 h-4 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-full shadow-lg"
              />
            ))}
          </div>
          
          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl px-8 py-4 inline-block border border-white/20"
          >
            <p className="text-base text-[#6B6B63] font-semibold tracking-wide flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ☕
              </motion.span>
              MORE THAN COFFEE, IT'S A FEELING
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                ✨
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Compact Spinner for inline use
export function CoffeeSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { container: "w-8 h-8", cup: "w-6 h-6", border: "border-2" },
    md: { container: "w-12 h-12", cup: "w-9 h-9", border: "border-3" },
    lg: { container: "w-16 h-16", cup: "w-12 h-12", border: "border-4" }
  };
  
  const config = sizes[size];
  
  return (
    <div className="flex items-center justify-center">
      <div className={`${config.container} relative`}>
        {/* Rotating Cup */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`${config.cup} ${config.border} border-[#C17817] border-t-transparent rounded-full`}
        />
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#C17817] rounded-full" />
      </div>
    </div>
  );
}

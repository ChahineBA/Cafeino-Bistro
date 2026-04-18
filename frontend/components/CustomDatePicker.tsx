"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  className?: string;
}

export default function CustomDatePicker({ value, onChange, label, className = '' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => isSameDay(date, value);
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentMonth);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-[#1A1614] mb-2">{label}</label>
      )}
      
      {/* Date Display Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl hover:border-[#c8956e] focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] font-semibold flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#C17817]" />
          <span>{format(value, 'MMMM d, yyyy')}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-5 h-5 text-[#6B6B63]" />
        </motion.div>
      </motion.button>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border-2 border-[#e5e5e5] p-6 w-full min-w-[320px]"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-[#F5F5F3] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#C17817]" />
                </motion.button>
                
                <h3 className="text-lg font-bold text-[#1A1614]">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[#F5F5F3] rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#C17817]" />
                </motion.button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-[#6B6B63] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const selected = isSelected(day);
                  const today = isToday(day);
                  const currentMonthDay = isCurrentMonth(day);

                  return (
                    <motion.button
                      key={day.toString()}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        relative aspect-square rounded-lg font-semibold text-sm transition-all
                        ${selected 
                          ? 'bg-gradient-to-br from-[#C17817] to-[#E8B86D] text-white shadow-lg scale-110' 
                          : today
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                          : currentMonthDay
                          ? 'hover:bg-[#F5F5F3] text-[#1A1614]'
                          : 'text-[#D1D1CC] hover:bg-gray-50'
                        }
                      `}
                    >
                      {format(day, 'd')}
                      {selected && (
                        <motion.div
                          layoutId="selectedDay"
                          className="absolute inset-0 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-lg -z-10"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Today Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today);
                  handleDateSelect(today);
                }}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Today
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

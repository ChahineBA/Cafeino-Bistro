"use client";

import { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { format } from 'date-fns';
import { Users, Clock, Calendar, Award, TrendingUp, Plus, UserPlus, X, Check, Mail, Lock, User, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDatePicker from '@/components/CustomDatePicker';

export default function WaitersPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'waiter'
  });
  const { data: services = [], isLoading } = useServices(format(selectedDate, 'yyyy-MM-dd'));
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Group services by waiter
  const waiterServices = services.reduce((acc: any, service) => {
    if (!acc[service.waiter_id]) {
      acc[service.waiter_id] = {
        waiter_name: service.waiter_name,
        services: []
      };
    }
    acc[service.waiter_id].services.push(service);
    return acc;
  }, {});

  const calculateTotalHours = (services: any[]) => {
    return services.reduce((total, service) => {
      return total + (service.duration_minutes || 0);
    }, 0) / 60;
  };

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating waiter:', error);
      alert(error.response?.data?.detail || 'Error creating waiter. Please try again.');
    }
  };

  const handleEditWaiter = (waiterId: string, waiterName: string) => {
    const user = users.find(u => u._id === waiterId);
    if (user) {
      setEditingWaiter({ id: waiterId, name: waiterName });
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '',
        role: user.role
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };
      
      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser.mutateAsync({ id: editingWaiter.id, data: updateData });
      setShowEditModal(false);
      setEditingWaiter(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating waiter:', error);
      alert(error.response?.data?.detail || 'Error updating waiter. Please try again.');
    }
  };

  const handleDeleteWaiter = async (waiterId: string, waiterName: string) => {
    if (confirm(`Are you sure you want to delete ${waiterName}? This action cannot be undone.`)) {
      try {
        await deleteUser.mutateAsync(waiterId);
      } catch (error: any) {
        console.error('Error deleting waiter:', error);
        alert(error.response?.data?.detail || 'Error deleting waiter. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'waiter'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Staff Management 👥</h1>
          <p className="text-[#6B6B63]">View service times and attendance records</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-bold rounded-xl shadow-xl shadow-[#D4AF37]/30 hover:shadow-2xl transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Add New Waiter
        </motion.button>
      </motion.div>

      {/* All Staff Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-[#1A1614] mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          All Staff Members
        </h2>
        
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#D1D1CC]" />
            <p className="text-[#6B6B63]">No staff members yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-white to-[#fafafa] rounded-xl p-4 border-2 border-[#e5e5e5] hover:border-[#D4AF37] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#FFD700]'
                        : 'bg-gradient-to-br from-[#C17817] to-[#E8B86D]'
                    }`}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1614]">{user.full_name}</p>
                      <p className="text-xs text-[#6B6B63]">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {user.role}
                  </span>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditWaiter(user._id, user.full_name)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: -15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteWaiter(user._id, user.full_name)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Date Selector & Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border-2 border-white/30"
            >
              <Calendar className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-white">Select Date</p>
              <p className="text-xs text-white/80">View attendance for specific date</p>
            </div>
          </div>
          <CustomDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="relative p-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg inline-flex mb-3"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <p className="text-sm font-medium text-[#6B6B63] mb-1">Staff Working</p>
            <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-[#1A1614]"
            >
              {Object.keys(waiterServices).length}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Staff Records */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : Object.keys(waiterServices).length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users className="w-20 h-20 mx-auto mb-4 text-[#D1D1CC]" />
          </motion.div>
          <p className="text-xl font-bold text-[#6B6B63] mb-2">No service records</p>
          <p className="text-[#A8A8A0]">No staff worked on this date</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(waiterServices).map(([waiterId, data]: any, index) => {
            const totalHours = calculateTotalHours(data.services);
            const activeService = data.services.find((s: any) => s.is_active);

            return (
              <motion.div
                key={waiterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C17817]/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
                
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#E8E8E5]">
                    <div className="flex items-center gap-4 flex-1">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-2xl flex items-center justify-center shadow-xl"
                      >
                        <Users className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#1A1614]">{data.waiter_name}</h3>
                        <p className="text-sm text-[#6B6B63] flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {data.services.length} shift(s) • {totalHours.toFixed(2)} hours total
                        </p>
                      </div>
                    </div>
                    {activeService && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="badge badge-success flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        Active Now
                      </motion.div>
                    )}
                  </div>

                  {/* Service Records */}
                  <div className="space-y-3">
                    {data.services.map((service: any, idx: number) => (
                      <motion.div
                        key={service._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 + idx * 0.05 }}
                        whileHover={{ x: 4, scale: 1.01 }}
                        className="bg-white/50 hover:bg-white rounded-xl p-4 border border-[#e5e5e5] transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#1A1614]">
                                {format(new Date(service.clock_in), 'h:mm a')}
                                {service.clock_out && ` - ${format(new Date(service.clock_out), 'h:mm a')}`}
                              </p>
                              <p className="text-sm text-[#6B6B63]">
                                {service.is_active ? (
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                    Active Session
                                  </span>
                                ) : service.duration_minutes ? (
                                  `Duration: ${Math.floor(service.duration_minutes / 60)}h ${service.duration_minutes % 60}m`
                                ) : (
                                  'Incomplete'
                                )}
                              </p>
                            </div>
                          </div>
                          <span className={`badge ${service.is_active ? 'badge-success' : 'badge-info'}`}>
                            {service.is_active ? 'Active' : 'Completed'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Waiter Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-xl shadow-lg">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1614]">Add New Waiter</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </motion.button>
                </div>
                
                <form onSubmit={handleCreateWaiter} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="waiter@cafeino.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white font-bold rounded-xl shadow-xl shadow-[#D4AF37]/30 transition-all"
                    >
                      <Check className="w-5 h-5" />
                      Create Waiter
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Waiter Modal */}
      <AnimatePresence>
        {showEditModal && editingWaiter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1614]">Edit Waiter</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </motion.button>
                </div>
                
                <form onSubmit={handleUpdateWaiter} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="waiter@cafeino.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">New Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="Leave empty to keep current"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/30 transition-all"
                    >
                      <Check className="w-5 h-5" />
                      Update Waiter
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

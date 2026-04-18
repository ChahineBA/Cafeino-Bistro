"use client";

import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Plus, Edit, Trash2, Package, Search, Coffee, X, Check, Filter, FolderPlus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'coffee',
    price: '',
    is_available: true
  });

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct._id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price.toString(),
      is_available: product.is_available
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'coffee',
      price: '',
      is_available: true
    });
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (category: string) => {
    const productsInCategory = products.filter(p => p.category === category);
    if (productsInCategory.length > 0) {
      alert(`Cannot delete category "${category}" because it has ${productsInCategory.length} product(s). Please reassign or delete those products first.`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
      // TODO: Implement category deletion in backend
      alert('Category deletion will be implemented when backend supports it.');
    }
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Category name cannot be empty');
      return;
    }
    
    if (editingCategory) {
      // Rename category - update all products with this category
      // TODO: Implement in backend
      alert(`Renaming category from "${editingCategory}" to "${newCategoryName}" will be implemented when backend supports it.`);
    } else {
      // Add new category
      alert(`New category "${newCategoryName}" will be available when you create a product with this category.`);
    }
    
    setShowCategoryModal(false);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const categoryColors: Record<string, string> = {
    coffee: 'from-amber-500 to-amber-600',
    pastries: 'from-pink-500 to-pink-600',
    sandwiches: 'from-green-500 to-green-600',
    beverages: 'from-blue-500 to-blue-600',
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
          <h1 className="text-4xl font-bold gradient-text mb-2">Product Management 📦</h1>
          <p className="text-[#6B6B63]">Manage your menu items and inventory</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl transition-all"
          >
            <FolderPlus className="w-5 h-5" />
            Manage Categories
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white font-bold rounded-xl shadow-xl shadow-[#C17817]/30 hover:shadow-2xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* Search, Filter & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A8A8A0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[#6B6B63]" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryFilter('')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  categoryFilter === ''
                    ? 'bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white shadow-lg'
                    : 'bg-white text-[#6B6B63] hover:bg-[#F5F5F3] border border-[#e5e5e5]'
                }`}
              >
                All
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    categoryFilter === category
                      ? 'bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white shadow-lg'
                      : 'bg-white text-[#6B6B63] hover:bg-[#F5F5F3] border border-[#e5e5e5]'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl p-6 border-2 border-[#C17817]/30 flex flex-col justify-center"
          >
            <p className="text-sm text-[#6B6B63] font-medium mb-2">Total Products</p>
            <p className="text-4xl font-bold gradient-text">{filteredProducts.length}</p>
            <p className="text-xs text-[#6B6B63] mt-1">of {products.length} total</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-16 text-center"
        >
          <Package className="w-20 h-20 mx-auto mb-4 text-[#D1D1CC]" />
          <p className="text-xl font-bold text-[#6B6B63] mb-2">No products found</p>
          <p className="text-[#A8A8A0]">Try adjusting your filters or add a new product</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-500 to-gray-600'} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-14 h-14 bg-gradient-to-br ${categoryColors[product.category] || 'from-gray-500 to-gray-600'} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <Coffee className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(product)}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: -15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(product._id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-bold text-xl text-[#1A1614] mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-[#6B6B63] mb-4 line-clamp-2">{product.description}</p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E8E8E5]">
                  <span className="text-3xl font-bold gradient-text">
                    {product.price.toFixed(2)} TND
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#7C9885]/20 to-[#9FB5A8]/20 text-[#5A7563] text-xs font-semibold rounded-full">
                      {product.category}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      product.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_available ? '✓ Available' : '✗ Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C17817]/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1A1614]">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </motion.button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                      placeholder="e.g., Cappuccino"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1614] mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0] resize-none"
                      placeholder="Brief description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1614] mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a]"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1614] mb-2">Price (TND)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl border-2 border-[#C17817]/30">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-5 h-5 text-[#C17817] rounded focus:ring-2 focus:ring-[#C17817] cursor-pointer"
                    />
                    <label htmlFor="available" className="text-sm font-semibold text-[#1A1614] cursor-pointer">
                      Available for sale
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={createProduct.isPending || updateProduct.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white font-bold rounded-xl shadow-xl shadow-[#C17817]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Check className="w-5 h-5" />
                      {editingProduct ? 'Update' : 'Create'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <FolderPlus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1614]">Manage Categories</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      setNewCategoryName('');
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </motion.button>
                </div>

                {/* Add New Category Section */}
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <h3 className="text-sm font-bold text-purple-900 mb-3">➕ Add New Category</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCategory ? '' : newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name..."
                      disabled={!!editingCategory}
                      className="flex-1 px-4 py-2 bg-white border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-[#1a1a1a] placeholder:text-[#a0a0a0] disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!editingCategory && newCategoryName.trim()) {
                          handleSaveCategory();
                        }
                      }}
                      disabled={!!editingCategory || !newCategoryName.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Existing Categories */}
                <div>
                  <h3 className="text-sm font-bold text-[#1A1614] mb-3">📁 Existing Categories</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {categories.map((category, index) => {
                      const productCount = products.filter(p => p.category === category).length;
                      const isEditing = editingCategory === category;
                      
                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-white border-2 border-[#e5e5e5] rounded-xl hover:border-purple-300 transition-all"
                        >
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                                autoFocus
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSaveCategory}
                                className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4 text-green-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingCategory(null);
                                  setNewCategoryName('');
                                }}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </motion.button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                                  <Package className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-[#1A1614]">{category}</p>
                                  <p className="text-xs text-[#6B6B63]">{productCount} product{productCount !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditCategory(category)}
                                  className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: -15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteCategory(category)}
                                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </motion.button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

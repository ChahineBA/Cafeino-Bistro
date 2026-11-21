const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit_price: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true,
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  waiter_id: {
    type: mongoose.Schema.Types.Mixed, // Flexible for both String and ObjectId
    required: true,
  },
  waiter_name: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for compatibility
orderSchema.virtual('createdAt').get(function() {
  return this.created_at;
});

orderSchema.virtual('updatedAt').get(function() {
  return this.updated_at;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

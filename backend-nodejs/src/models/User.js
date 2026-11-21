const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['waiter', 'admin'],
    default: 'waiter',
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for compatibility
userSchema.virtual('created_at_compat').get(function() {
  return this.created_at;
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');

// Generic key/value store for app-wide settings (e.g. key "receipt").
const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  minimize: false,
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;

const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  waiter_id: {
    type: String,
    required: true,
  },
  waiter_name: {
    type: String,
    required: true,
  },
  clock_in: {
    type: Date,
    required: true,
  },
  clock_out: {
    type: Date,
  },
  duration_minutes: {
    type: Number,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

const ServiceRecord = mongoose.model('ServiceRecord', serviceRecordSchema);

module.exports = ServiceRecord;

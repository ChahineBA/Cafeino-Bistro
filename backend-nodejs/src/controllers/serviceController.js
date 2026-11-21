const ServiceRecord = require('../models/ServiceRecord');

// @desc    Clock in
// @route   POST /api/services/clock-in
// @access  Private
const clockIn = async (req, res) => {
  const activeService = await ServiceRecord.findOne({
    waiter_id: req.user._id.toString(),
    is_active: true,
  });

  if (activeService) {
    return res.status(400).json({ detail: 'You are already clocked in. Please clock out first.' });
  }

  const now = new Date();
  const service = await ServiceRecord.create({
    waiter_id: req.user._id.toString(),
    waiter_name: req.user.full_name,
    clock_in: now,
    date: now.toISOString().split('T')[0],
    is_active: true,
  });

  res.status(201).json(service);
};

// @desc    Clock out
// @route   POST /api/services/clock-out
// @access  Private
const clockOut = async (req, res) => {
  const activeService = await ServiceRecord.findOne({
    waiter_id: req.user._id.toString(),
    is_active: true,
  });

  if (!activeService) {
    return res.status(400).json({ detail: 'You are not currently clocked in.' });
  }

  const clockOutTime = new Date();
  const clockInTime = activeService.clock_in;
  const duration = (clockOutTime - clockInTime) / (1000 * 60); // minutes

  activeService.clock_out = clockOutTime;
  activeService.duration_minutes = Math.round(duration);
  activeService.is_active = false;

  const updatedService = await activeService.save();
  res.json(updatedService);
};

// @desc    Get service records
// @route   GET /api/services
// @access  Private
const getServices = async (req, res) => {
  const { date } = req.query;
  const query = {};

  if (req.user.role !== 'admin') {
    query.waiter_id = req.user._id.toString();
  }

  if (date) {
    query.date = date;
  }

  const services = await ServiceRecord.find(query).sort({ clock_in: -1 });
  res.json(services);
};

// @desc    Get services by date
// @route   GET /api/services/date/:date
// @access  Private/Admin
const getServicesByDate = async (req, res) => {
  const services = await ServiceRecord.find({ date: req.params.date }).sort({ clock_in: -1 });
  res.json(services);
};

// @desc    Get active service
// @route   GET /api/services/active
// @access  Private
const getActiveService = async (req, res) => {
  const activeService = await ServiceRecord.findOne({
    waiter_id: req.user._id.toString(),
    is_active: true,
  });

  res.json(activeService);
};

module.exports = {
  clockIn,
  clockOut,
  getServices,
  getServicesByDate,
  getActiveService,
};

const Setting = require('../models/Setting');

// Receipt content shown on every printed receipt. Keep in sync with
// DEFAULT_RECEIPT_SETTINGS in frontend/lib/receiptSettings.ts.
const RECEIPT_DEFAULTS = {
  businessName: 'CAFEINO BISTRO',
  tagline: 'Where Every Cup Tells a Story',
  phone: '(555) 123-4567',
  website: 'www.cafeinobistro.com',
  socialMediaText: 'Follow us on social media',
  socialMediaHandle: '@cafeinobistro',
  topMessage: 'Thank you for your order!',
  bottomMessage: 'We hope you enjoyed your experience. Please visit us again soon!',
  showLogo: true,
  showSocialMedia: true,
};
const MAX_TEXT_LENGTH = 300;

// Keep only known fields with the right types; anything else is rejected.
const sanitizeReceiptSettings = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Settings must be an object');
  }
  const clean = {};
  for (const [field, defaultValue] of Object.entries(RECEIPT_DEFAULTS)) {
    if (!(field in input)) continue;
    const value = input[field];
    if (typeof defaultValue === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`"${field}" must be true or false`);
      clean[field] = value;
    } else {
      if (typeof value !== 'string') throw new Error(`"${field}" must be text`);
      if (value.length > MAX_TEXT_LENGTH) throw new Error(`"${field}" is too long (max ${MAX_TEXT_LENGTH} characters)`);
      clean[field] = value.trim();
    }
  }
  return clean;
};

const loadReceiptSettings = async () => {
  const doc = await Setting.findOne({ key: 'receipt' }).lean();
  return { ...RECEIPT_DEFAULTS, ...(doc?.value || {}) };
};

// @desc    Get receipt settings (defaults merged with saved values)
// @route   GET /api/settings/receipt
// @access  Private
const getReceiptSettings = async (req, res) => {
  try {
    res.json(await loadReceiptSettings());
  } catch (error) {
    res.status(500).json({ detail: 'Could not load receipt settings' });
  }
};

// @desc    Update receipt settings
// @route   PUT /api/settings/receipt
// @access  Private/Admin
const updateReceiptSettings = async (req, res) => {
  let updates;
  try {
    updates = sanitizeReceiptSettings(req.body);
  } catch (error) {
    return res.status(400).json({ detail: error.message });
  }

  try {
    const current = await loadReceiptSettings();
    const value = { ...current, ...updates };
    await Setting.findOneAndUpdate(
      { key: 'receipt' },
      { key: 'receipt', value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(value);
  } catch (error) {
    res.status(500).json({ detail: 'Could not save receipt settings' });
  }
};

module.exports = {
  getReceiptSettings,
  updateReceiptSettings,
  RECEIPT_DEFAULTS,
};

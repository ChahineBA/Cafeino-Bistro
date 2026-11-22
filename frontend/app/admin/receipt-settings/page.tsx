"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Save, RotateCcw, Printer } from 'lucide-react';
import { useReceiptSettings, useUpdateReceiptSettings } from '@/hooks/useReceiptSettings';
import { DEFAULT_RECEIPT_SETTINGS, ReceiptSettings } from '@/lib/receiptSettings';
import { buildReceiptHTML, openReceiptWindow } from '@/lib/generateReceipt';

// Sample order used for the live preview and the test print.
const SAMPLE_RECEIPT = {
  title: 'Receipt - Test Print',
  items: [
    { product_name: 'CAPPUCCINO', quantity: 2, subtotal: 9 },
    { product_name: 'CROISSANT AU CHOCOLAT', quantity: 1, subtotal: 2.5 },
  ],
  total: 11.5,
};

export default function ReceiptSettingsPage() {
  const { data: savedSettings, isLoading, isError, refetch } = useReceiptSettings();
  const updateSettings = useUpdateReceiptSettings();

  const [settings, setSettings] = useState<ReceiptSettings>(DEFAULT_RECEIPT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewHeight, setPreviewHeight] = useState(560);

  // Fill the form once with the settings stored in the database.
  useEffect(() => {
    if (savedSettings && !loaded) {
      setSettings(savedSettings);
      setLoaded(true);
    }
  }, [savedSettings, loaded]);

  const handleSave = async () => {
    if (!loaded) return; // never overwrite the stored settings with unloaded defaults
    setSaveError(null);
    try {
      const result = await updateSettings.mutateAsync(settings);
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      setSaveError(error?.response?.data?.detail || 'Could not save. Check that the server is running and try again.');
    }
  };

  // Puts the default values in the form; click "Save Changes" to apply them.
  const handleReset = () => {
    setSettings(DEFAULT_RECEIPT_SETTINGS);
    setSaveError(null);
  };

  // Live preview = the exact receipt template that gets printed.
  const previewHTML = useMemo(
    () => buildReceiptHTML({ ...SAMPLE_RECEIPT, settings, origin: '' }),
    [settings]
  );

  const handlePrintPreview = () => {
    const html = buildReceiptHTML({ ...SAMPLE_RECEIPT, settings, origin: window.location.origin, autoPrint: true });
    if (!openReceiptWindow(html)) {
      alert('Could not open the test print. Please allow popups for this site and try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Receipt Settings 🧾</h1>
          <p className="text-[#6B6B63]">Customize your receipt design and messages</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Default
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!loaded || updateSettings.isPending}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              saved
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white shadow-[#C17817]/30'
            }`}
          >
            {updateSettings.isPending ? (
              <>
                <Save className="w-5 h-5 animate-pulse" />
                Saving...
              </>
            ) : saved ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  ✓
                </motion.div>
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Status */}
      {isLoading && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
          Loading the saved receipt settings...
        </div>
      )}
      {isError && !loaded && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>Could not load the receipt settings from the server, so saving is disabled to avoid overwriting them.</span>
          <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 font-semibold">
            Retry
          </button>
        </div>
      )}
      {saveError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {saveError}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#C17817] to-[#E8B86D] rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A1614]">Receipt Content</h2>
              <p className="text-sm text-[#6B6B63]">Customize messages and display options</p>
            </div>
          </div>

          {/* Business Info Section */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-3">🏪 Business Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1614] mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1614] mb-1">Website</label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h3 className="text-sm font-bold text-purple-900 mb-3">📱 Social Media</h3>
            
            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">Social Media Text</label>
              <input
                type="text"
                value={settings.socialMediaText}
                onChange={(e) => setSettings({ ...settings, socialMediaText: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">Social Media Handle</label>
              <input
                type="text"
                value={settings.socialMediaHandle}
                onChange={(e) => setSettings({ ...settings, socialMediaHandle: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all text-sm"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Customer Messages Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1A1614]">💬 Customer Messages</h3>
            
            {/* Top Message */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">
                Top Message (Thank You)
              </label>
              <input
                type="text"
                value={settings.topMessage}
                onChange={(e) => setSettings({ ...settings, topMessage: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a]"
                placeholder="Thank you message..."
              />
              <p className="text-xs text-[#6B6B63] mt-1">Appears at the top of the message section</p>
            </div>

            {/* Bottom Message */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">
                Bottom Message (Customer Message)
              </label>
              <textarea
                value={settings.bottomMessage}
                onChange={(e) => setSettings({ ...settings, bottomMessage: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a] resize-none"
                placeholder="Customer message..."
              />
              <p className="text-xs text-[#6B6B63] mt-1">Main message to customers. Press Enter for a new line.</p>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1A1614]">Display Options</h3>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl border-2 border-[#C17817]/30">
              <input
                type="checkbox"
                id="showLogo"
                checked={settings.showLogo}
                onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                className="w-5 h-5 text-[#C17817] rounded focus:ring-2 focus:ring-[#C17817] cursor-pointer"
              />
              <label htmlFor="showLogo" className="text-sm font-semibold text-[#1A1614] cursor-pointer">
                Show Cafeino Logo
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#C17817]/10 to-[#E8B86D]/10 rounded-xl border-2 border-[#C17817]/30">
              <input
                type="checkbox"
                id="showSocialMedia"
                checked={settings.showSocialMedia}
                onChange={(e) => setSettings({ ...settings, showSocialMedia: e.target.checked })}
                className="w-5 h-5 text-[#C17817] rounded focus:ring-2 focus:ring-[#C17817] cursor-pointer"
              />
              <label htmlFor="showSocialMedia" className="text-sm font-semibold text-[#1A1614] cursor-pointer">
                Show Social Media Info
              </label>
            </div>
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 sticky top-40"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A1614]">Live Preview</h2>
                <p className="text-sm text-[#6B6B63]">80mm thermal printer</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrintPreview}
              className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              title="Print Preview"
            >
              <Printer className="w-5 h-5 text-purple-600" />
            </motion.button>
          </div>

          {/* Receipt Preview: the real receipt template, rendered with the current form values */}
          <div className="border-4 border-gray-300 rounded-2xl p-4 bg-gray-50 shadow-inner overflow-hidden flex justify-center">
            <iframe
              title="Receipt preview"
              srcDoc={previewHTML}
              className="bg-white shadow-lg rounded-lg border-2 border-gray-200"
              style={{ width: 340, height: previewHeight, maxWidth: '100%' }}
              onLoad={(e) => {
                // Size the frame to the receipt itself (documentElement never reports less than the frame).
                const body = e.currentTarget.contentDocument?.body;
                if (body) setPreviewHeight(Math.ceil(body.getBoundingClientRect().height) + 8);
              }}
            />
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 Click &quot;Save Changes&quot; to apply. Settings are stored on the server and used for every receipt, on every device.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

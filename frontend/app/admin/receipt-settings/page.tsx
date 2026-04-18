"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Save, RotateCcw, Printer } from 'lucide-react';

export default function ReceiptSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "CAFEINO BISTRO",
    tagline: "Where Every Cup Tells a Story",
    phone: "(555) 123-4567",
    website: "www.cafeinobistro.com",
    socialMediaText: "Follow us on social media",
    socialMediaHandle: "@cafeinobistro",
    topMessage: "Thank you for your order!",
    bottomMessage: "We hope you enjoyed your experience. Please visit us again soon!",
    showLogo: true,
    showSocialMedia: true,
    footerText: "Powered by Cafeino POS System"
  });

  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('receiptSettings');
    if (stored) {
      try {
        const loadedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        setSettings({
          businessName: loadedSettings.businessName || "CAFEINO BISTRO",
          tagline: loadedSettings.tagline || "Where Every Cup Tells a Story",
          phone: loadedSettings.phone || "(555) 123-4567",
          website: loadedSettings.website || "www.cafeinobistro.com",
          socialMediaText: loadedSettings.socialMediaText || "Follow us on social media",
          socialMediaHandle: loadedSettings.socialMediaHandle || "@cafeinobistro",
          topMessage: loadedSettings.topMessage || "Thank you for your order!",
          bottomMessage: loadedSettings.bottomMessage || "We hope you enjoyed your experience. Please visit us again soon!",
          showLogo: loadedSettings.showLogo !== undefined ? loadedSettings.showLogo : true,
          showSocialMedia: loadedSettings.showSocialMedia !== undefined ? loadedSettings.showSocialMedia : true,
          footerText: loadedSettings.footerText || "Powered by Cafeino POS System"
        });
      } catch (error) {
        console.error('Error loading receipt settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('receiptSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      businessName: "CAFEINO BISTRO",
      tagline: "Where Every Cup Tells a Story",
      phone: "(555) 123-4567",
      website: "www.cafeinobistro.com",
      socialMediaText: "Follow us on social media",
      socialMediaHandle: "@cafeinobistro",
      topMessage: "Thank you for your order!",
      bottomMessage: "We hope you enjoyed your experience. Please visit us again soon!",
      showLogo: true,
      showSocialMedia: true,
      footerText: "Powered by Cafeino POS System"
    };
    setSettings(defaultSettings);
    localStorage.setItem('receiptSettings', JSON.stringify(defaultSettings));
  };

  const handlePrintPreview = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt Preview</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt { width: 100%; }
          .header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          .logo-image {
            width: 60mm;
            height: auto;
            max-height: 25mm;
            margin: 0 auto 8px;
            display: block;
            object-fit: contain;
          }
          .tagline {
            font-size: 10px;
            font-style: italic;
            margin-bottom: 5px;
          }
          .contact-info {
            font-size: 9px;
            margin-top: 5px;
            line-height: 1.5;
          }
          .order-info {
            margin-bottom: 10px;
            font-size: 11px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .info-label { font-weight: bold; }
          .items-section { margin: 10px 0; }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid #000;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .item-detail {
            font-size: 9px;
            color: #666;
            margin-left: 5px;
            margin-bottom: 3px;
          }
          .total-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
          }
          .message-section {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          .thank-you {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .customer-message {
            font-style: italic;
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .social-media {
            font-size: 10px;
            margin: 8px 0;
            padding: 6px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 9px;
          }
          @media print {
            body { width: 80mm; margin: 0; padding: 5px; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${settings.showLogo ? `
          <div class="header">
            <div class="logo-container">
              <img src="${window.location.origin}/logo.png" alt="Cafeino Bistro" class="logo-image" />
              <div class="tagline">"${settings.tagline}"</div>
            </div>
            <div class="contact-info">
              Tel: ${settings.phone}<br>
              ${settings.website}
            </div>
          </div>
          ` : ''}

          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Order #:</span>
              <span>ORD-SAMPLE</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div style="border-top: 2px solid #000; margin: 10px 0;"></div>

          <div class="items-section">
            <div class="items-header">
              <span style="flex: 1;">ITEM</span>
              <span style="width: 30px; text-align: center;">QTY</span>
              <span style="width: 60px; text-align: right;">PRICE</span>
            </div>
            <div class="item-row">
              <div style="flex: 1;">CAPPUCCINO</div>
              <div style="width: 30px; text-align: center;">2</div>
              <div style="width: 60px; text-align: right;">9.00 TND</div>
            </div>
            <div class="item-detail">@ 4.50 TND each</div>
            <div class="item-row">
              <div style="flex: 1;">CROISSANT</div>
              <div style="width: 30px; text-align: center;">1</div>
              <div style="width: 60px; text-align: right;">2.00 TND</div>
            </div>
            <div class="item-detail">@ 2.00 TND each</div>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span>TOTAL:</span>
              <span>11.00 TND</span>
            </div>
          </div>

          <div class="message-section">
            <div class="thank-you">★ ${settings.topMessage.toUpperCase()} ★</div>
            <div class="customer-message">
              ${settings.bottomMessage}
            </div>
            ${settings.showSocialMedia ? `
            <div class="social-media">
              ${settings.socialMediaText}<br>
              <strong>${settings.socialMediaHandle}</strong>
            </div>
            ` : ''}
            <div style="margin-top: 10px; font-size: 10px;">
              ═══════════════════════
            </div>
          </div>

          <div class="footer">
            ${settings.footerText}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
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
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-xl transition-all ${
              saved
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-[#C17817] to-[#E8B86D] text-white shadow-[#C17817]/30'
            }`}
          >
            {saved ? (
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
              <p className="text-xs text-[#6B6B63] mt-1">Main message to customers</p>
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1614] mb-1">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl focus:border-[#c8956e] focus:ring-4 focus:ring-[#c8956e]/10 outline-none transition-all text-[#1a1a1a]"
                placeholder="Footer text..."
              />
              <p className="text-xs text-[#6B6B63] mt-1">Appears at the very bottom</p>
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

          {/* Receipt Preview */}
          <div className="border-4 border-gray-300 rounded-2xl p-4 bg-white shadow-inner overflow-hidden">
            <div className="max-w-[280px] mx-auto text-xs leading-relaxed bg-white p-4 border-2 border-gray-200 rounded-lg shadow-lg relative">
              {/* Header */}
              {settings.showLogo && (
                <div className="text-center mb-3 pb-3 border-b-[3px] border-double border-black">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-48 h-auto max-h-20 mx-auto mb-2 object-contain grayscale"
                  />
                  <div className="text-[10px] italic mb-2">&quot;{settings.tagline}&quot;</div>
                  <div className="text-[9px] leading-relaxed">
                    Tel: {settings.phone}<br/>
                    {settings.website}
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="mb-2 text-[10px]">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Order #:</span>
                  <span>ORD-SAMPLE</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Status:</span>
                  <span>PENDING</span>
                </div>
              </div>

              <div className="border-t-2 border-black my-2"></div>

              {/* Items */}
              <div className="mb-2">
                <div className="flex justify-between font-bold text-[10px] mb-1 pb-1 border-b border-black">
                  <span className="flex-1">ITEM</span>
                  <span className="w-8 text-center">QTY</span>
                  <span className="w-16 text-right">PRICE</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div>
                    <div className="flex justify-between">
                      <span className="flex-1">CAPPUCCINO</span>
                      <span className="w-8 text-center">2</span>
                      <span className="w-16 text-right">9.00 TND</span>
                    </div>
                    <div className="text-[8px] text-gray-600 ml-1">@ 4.50 TND each</div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="flex-1">CROISSANT</span>
                      <span className="w-8 text-center">1</span>
                      <span className="w-16 text-right">2.00 TND</span>
                    </div>
                    <div className="text-[8px] text-gray-600 ml-1">@ 2.00 TND each</div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-black my-2"></div>

              {/* Total */}
              <div className="flex justify-between font-bold text-sm mb-2 pt-2">
                <span>TOTAL:</span>
                <span>11.00 TND</span>
              </div>

              {/* Messages */}
              <div className="text-center border-t-2 border-dashed border-black pt-2 text-[10px]">
                <div className="font-bold mb-2">★ {settings.topMessage.toUpperCase()} ★</div>
                <div className="italic mb-2 leading-snug">
                  {settings.bottomMessage}
                </div>
                {settings.showSocialMedia && (
                  <div className="text-[8px] mb-2">
                    {settings.socialMediaText}<br/>
                    {settings.socialMediaHandle}
                  </div>
                )}
                <div className="text-[9px] my-2">═══════════════════</div>
                <div className="text-[8px]">{settings.footerText}</div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 Changes are saved locally and will apply to all future receipts
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

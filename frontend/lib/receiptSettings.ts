// Receipt content, stored in the database (GET/PUT /api/settings/receipt) so it is
// shared by every device. Keep defaults in sync with
// backend-nodejs/src/controllers/settingsController.js (RECEIPT_DEFAULTS).
export interface ReceiptSettings {
  businessName: string;
  tagline: string;
  phone: string;
  website: string;
  socialMediaText: string;
  socialMediaHandle: string;
  topMessage: string;
  bottomMessage: string;
  showLogo: boolean;
  showSocialMedia: boolean;
}

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
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
};

/** Fill in any missing field with its default. */
export const withReceiptDefaults = (settings?: Partial<ReceiptSettings> | null): ReceiptSettings => ({
  ...DEFAULT_RECEIPT_SETTINGS,
  ...(settings || {}),
});

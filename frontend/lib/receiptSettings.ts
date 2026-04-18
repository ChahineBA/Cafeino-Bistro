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
  footerText: string;
}

export const getReceiptSettings = (): ReceiptSettings => {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }

  const stored = localStorage.getItem('receiptSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      return getDefaultSettings();
    }
  }
  return getDefaultSettings();
};

export const getDefaultSettings = (): ReceiptSettings => ({
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

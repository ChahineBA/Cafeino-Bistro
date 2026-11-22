import { ReceiptSettings } from './receiptSettings';

// The single receipt template used everywhere: new-order receipt, reprint from the
// orders list, and the Receipt Settings test print + live preview.

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

export interface ReceiptData {
  /** Browser/print-window title, e.g. "Receipt - Order #ORD-..." */
  title: string;
  items: ReceiptItem[];
  total: number;
  notes?: string;
  settings: ReceiptSettings;
  /** Origin used to load the logo, e.g. window.location.origin. '' = relative URL. */
  origin: string;
  /** Open the print dialog on load and close the window afterwards. */
  autoPrint?: boolean;
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Escape, then keep the admin's line breaks. */
const escapeMultiline = (value: unknown) => escapeHtml(value).replace(/\r?\n/g, '<br>');

const money = (value: unknown) => `${Number(value || 0).toFixed(2)} TND`;

const AUTO_PRINT_SCRIPT = `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
        window.addEventListener('afterprint', function() {
          setTimeout(function() { window.close(); }, 500);
        });
      }, 300);
    });
  </script>`;

export const buildReceiptHTML = ({ title, items, total, notes, settings, origin, autoPrint = false }: ReceiptData) => {
  const s = settings;
  const contactLines = [s.phone && `Tel: ${escapeHtml(s.phone)}`, s.website && escapeHtml(s.website)].filter(Boolean);
  const showHeader = s.showLogo || !!s.tagline || contactLines.length > 0;
  const showSocial = s.showSocialMedia && (!!s.socialMediaText || !!s.socialMediaHandle);
  const showMessages = !!s.topMessage || !!s.bottomMessage || showSocial;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
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
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px dashed #000;
    }
    .logo-container { margin-bottom: 8px; }
    .logo-image {
      width: 60mm;
      height: auto;
      max-height: 25mm;
      margin: 0 auto 8px;
      display: block;
      object-fit: contain;
    }
    .tagline { font-size: 10px; font-style: italic; margin-bottom: 5px; }
    .contact-info { font-size: 9px; margin-top: 5px; }
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
    .item-name { flex: 1; padding-right: 5px; }
    .item-qty { width: 30px; text-align: center; }
    .item-price { width: 60px; text-align: right; }
    .notes-section {
      margin: 10px 0;
      padding: 8px;
      border: 1px dashed #000;
      font-size: 10px;
    }
    .notes-label { font-weight: bold; margin-bottom: 3px; }
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
    .thank-you { font-weight: bold; font-size: 13px; margin-bottom: 8px; }
    .customer-message { font-style: italic; margin-bottom: 8px; line-height: 1.5; }
    .footer-note { font-size: 9px; margin-top: 8px; }
    @media print {
      body { width: 80mm; margin: 0; padding: 5px; }
      @page { size: 80mm auto; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    ${showHeader ? `
    <div class="header">
      <div class="logo-container">
        ${s.showLogo ? `<img src="${origin}/receipt-logo.png" alt="${escapeHtml(s.businessName)}" class="logo-image" />` : ''}
        ${s.tagline ? `<div class="tagline">"${escapeHtml(s.tagline)}"</div>` : ''}
      </div>
      ${contactLines.length ? `<div class="contact-info">${contactLines.join('<br>')}</div>` : ''}
    </div>` : ''}

    <div class="items-section">
      <div class="items-header">
        <span style="flex: 1;">ITEM</span>
        <span style="width: 30px; text-align: center;">QTY</span>
        <span style="width: 60px; text-align: right;">PRICE</span>
      </div>
      ${items.map((item) => `
      <div class="item-row">
        <div class="item-name">${escapeHtml(item.product_name)}</div>
        <div class="item-qty">${escapeHtml(item.quantity)}</div>
        <div class="item-price">${money(item.subtotal)}</div>
      </div>`).join('')}
    </div>

    ${notes ? `
    <div class="notes-section">
      <div class="notes-label">SPECIAL INSTRUCTIONS:</div>
      <div>${escapeMultiline(notes)}</div>
    </div>` : ''}

    <div class="total-section">
      <div class="total-row">
        <span>TOTAL:</span>
        <span>${money(total)}</span>
      </div>
    </div>

    ${showMessages ? `
    <div class="message-section">
      ${s.topMessage ? `<div class="thank-you">★ ${escapeHtml(s.topMessage.toUpperCase())} ★</div>` : ''}
      ${s.bottomMessage ? `<div class="customer-message">${escapeMultiline(s.bottomMessage)}</div>` : ''}
      ${showSocial ? `<div class="footer-note">${[s.socialMediaText, s.socialMediaHandle].filter(Boolean).map(escapeHtml).join('<br>')}</div>` : ''}
    </div>` : ''}
  </div>
  ${autoPrint ? AUTO_PRINT_SCRIPT : ''}
</body>
</html>`;
};

/**
 * Open a receipt in a new window (which prints itself when autoPrint is on).
 * Must be called directly from a click handler so the popup isn't blocked.
 * Returns false if the browser blocked the popup or writing failed.
 */
export const openReceiptWindow = (html: string): boolean => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return false;
  try {
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('Error generating receipt:', error);
    printWindow.close();
    return false;
  }
};

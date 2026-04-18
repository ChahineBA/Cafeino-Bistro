import { getReceiptSettings } from './receiptSettings';

export const generateReceiptHTML = (order: any, cart: any[], total: number, notes: string) => {
  const settings = getReceiptSettings();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - Order #${order.order_number || 'N/A'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          width: 80mm;
          margin: 0 auto;
          padding: 10px;
          background: white;
          font-size: 12px;
          line-height: 1.4;
        }
        .receipt { 
          width: 100%;
          position: relative;
        }
        /* Coffee bean decorations */
        .bean {
          position: absolute;
          width: 8px;
          height: 10px;
          background: #000;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          opacity: 0.08;
        }
        .bean::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 8px;
          background: white;
          left: 3px;
          top: 1px;
          border-radius: 50%;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 3px double #000;
          position: relative;
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
          margin-bottom: 6px;
        }
        .contact-info {
          font-size: 9px;
          margin-top: 5px;
          line-height: 1.5;
        }
        .divider {
          text-align: center;
          margin: 8px 0;
          font-size: 11px;
          letter-spacing: 4px;
        }
        .coffee-art {
          text-align: center;
          font-size: 16px;
          margin: 8px 0;
          font-family: monospace;
        }
        .order-info {
          padding: 8px;
          border: 2px solid #000;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .info-label { font-weight: 700; }
        .items-section { 
          margin: 10px 0;
          padding: 8px;
          border: 1px solid #000;
        }
        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 2px solid #000;
          font-size: 11px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
          padding: 3px 0;
        }
        .item-name {
          flex: 1;
          font-weight: 600;
        }
        .item-detail {
          font-size: 9px;
          color: #666;
          margin-left: 5px;
          margin-bottom: 3px;
        }
        .total-section {
          padding: 10px;
          border: 3px double #000;
          margin: 10px 0;
          text-align: center;
          background: #000;
          color: white;
        }
        .total-row {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .message-section {
          text-align: center;
          margin-top: 12px;
          padding: 10px;
          border: 2px dashed #000;
        }
        .thank-you {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .customer-message {
          font-size: 11px;
          margin-bottom: 8px;
          line-height: 1.5;
          font-style: italic;
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
        .heart {
          font-size: 14px;
          margin-bottom: 4px;
        }
        @media print {
          body { width: 80mm; margin: 0; padding: 8px; }
          @page { size: 80mm auto; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Coffee bean decorations -->
        <div class="bean" style="top: 5px; left: 5px;"></div>
        <div class="bean" style="top: 5px; right: 5px;"></div>
        <div class="bean" style="bottom: 5px; left: 10px;"></div>
        <div class="bean" style="bottom: 5px; right: 10px;"></div>
        
        ${settings.showLogo ? `
        <div class="header">
          <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png" alt="${settings.businessName}" class="logo-image" />
          <div class="tagline">"${settings.tagline}"</div>
          <div class="contact-info">
            Tel: ${settings.phone}<br>
            ${settings.website}
          </div>
        </div>
        ` : ''}

        <!-- Coffee cup ASCII art -->
        <div class="coffee-art">
          ( (
           ) )
          ....
          |  |]
          \\  /
           --
        </div>

        <div class="divider">~ ~ ~</div>

        <div class="order-info">
          <div class="info-row">
            <span class="info-label">Order #:</span>
            <span>${order.order_number || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date(order.created_at || new Date()).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span>${new Date(order.created_at || new Date()).toLocaleTimeString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span>${order.status || 'PENDING'}</span>
          </div>
        </div>

        <div class="divider">~ ~ ~</div>

        <div class="items-section">
          <div class="items-header">
            <span style="flex: 1;">ITEM</span>
            <span style="width: 30px; text-align: center;">QTY</span>
            <span style="width: 60px; text-align: right;">PRICE</span>
          </div>
          ${cart.map(item => `
            <div>
              <div class="item-row">
                <div class="item-name">${item.product_name}</div>
                <div style="width: 30px; text-align: center; font-weight: 600;">x${item.quantity}</div>
                <div style="width: 60px; text-align: right; font-weight: 700;">${item.subtotal.toFixed(2)}</div>
              </div>
              <div class="item-detail">@ ${item.unit_price.toFixed(2)} TND each</div>
            </div>
          `).join('')}
        </div>

        <div class="divider">~ ~ ~</div>

        ${notes ? `
        <div style="margin: 10px 0; padding: 8px; border: 1px dashed #000; font-size: 10px;">
          <div style="font-weight: bold; margin-bottom: 3px;">SPECIAL INSTRUCTIONS:</div>
          <div>${notes}</div>
        </div>
        <div class="divider">~ ~ ~</div>
        ` : ''}

        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)} TND</span>
          </div>
        </div>

        <div class="message-section">
          <div class="thank-you">* ${settings.topMessage.toUpperCase()} *</div>
          <div class="customer-message">
            ${settings.bottomMessage}
          </div>
          ${settings.showSocialMedia ? `
          <div class="social-media">
            ${settings.socialMediaText}<br>
            <strong>${settings.socialMediaHandle}</strong>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="heart">♥</div>
          ${settings.footerText}
        </div>
      </div>
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() {
            window.print();
            window.addEventListener('afterprint', function() {
              setTimeout(function() {
                window.close();
              }, 500);
            });
          }, 300);
        });
      </script>
    </body>
    </html>
  `;
};

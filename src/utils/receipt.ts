/* eslint-disable @typescript-eslint/no-explicit-any */
// Receipt generation utility
export interface ReceiptData {
  storeName?: string;
  address?: string;
  transactionDate?: Date;
  receiptNumber: string;
  cashierName?: string;
  customerName?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashAmount?: number;
  change?: number;
  currencySymbol?: string; // Add currency symbol for receipt display
}

export interface StoreSettings {
  name?: string;
  address?: string;
  receipt_footer?: string;
  return_policy?: string;
}

export interface BusinessSettings {
  receipt_footer?: string;
  return_policy?: string;
  [key: string]: unknown; // Allow additional properties
}

// Generate receipt HTML for 80mm thermal paper
export const generateReceiptHTML = (
  receiptData: ReceiptData,
  currentStore: any,
  currentStoreSettings: StoreSettings | null,
  currentBusinessSettings: BusinessSettings | null,
  formatDate: (date: Date) => string,
  formatTime: (date: Date, format?: string) => string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          margin: 0;
          padding: 8px;
          width: 80mm;
          max-width: 80mm;
          background: white;
          color: black;
        }
        
        .receipt-container {
          width: 100%;
          max-width: 80mm;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .store-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 3px;
          text-transform: uppercase;
        }
        
        .store-address {
          font-size: 9px;
          margin-bottom: 3px;
          line-height: 1.2;
        }
        
        .receipt-info {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .receipt-number {
          font-size: 10px;
          margin-bottom: 5px;
        }
        
        .cashier-info {
          font-size: 9px;
          margin-bottom: 5px;
        }
        
        .datetime {
          font-size: 9px;
          color: #666;
        }
        
        .items-section {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 9px;
          line-height: 1.2;
        }
        
        .item-name {
          flex: 1;
          margin-right: 10px;
        }
        
        .item-details {
          text-align: right;
          white-space: nowrap;
        }
        
        .totals-section {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 10px;
        }
        
        .total-row.final {
          font-weight: bold;
          font-size: 12px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        
        .payment-info {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 9px;
        }
        
        .footer {
          text-align: center;
          font-size: 8px;
          line-height: 1.3;
          color: #666;
        }
        
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 5px;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .receipt-container {
            width: 80mm;
            max-width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- Header -->
        <div class="header">
          <div class="store-name">${receiptData.storeName || currentStore?.name || 'STORE'}</div>
          <div class="store-address">${receiptData.address || currentStore?.address || ''}</div>
          <div class="datetime">${formatDate(new Date(receiptData.transactionDate || new Date()))} ${formatTime(new Date(receiptData.transactionDate || new Date()), '12h')}</div>
        </div>
        
        <!-- Receipt Info -->
        <div class="receipt-info">
          <div class="receipt-number">Receipt #: ${receiptData.receiptNumber}</div>
          <div class="cashier-info">Cashier: ${receiptData.cashierName || 'Unknown'}</div>
          ${receiptData.customerName && receiptData.customerName !== 'Walk-in Customer' ? 
            `<div class="cashier-info">Customer: ${receiptData.customerName}</div>` : ''}
        </div>
        
        <!-- Items -->
        <div class="items-section">
          <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 8px;">
            <span class="item-name">ITEM</span>
            <span class="item-details">QTY × PRICE</span>
          </div>
          ${receiptData.items?.map((item: { name: string; quantity: number; price: number; }) => `
            <div class="item">
              <span class="item-name">${item.name}</span>
              <span class="item-details">${item.quantity} × ${receiptData.currencySymbol || '$'}${item.price}</span>
            </div>
          `).join('') || ''}
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${receiptData.currencySymbol || '$'}${receiptData.subtotal}</span>
          </div>
          ${receiptData.tax > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>${receiptData.currencySymbol || '$'}${receiptData.tax}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${receiptData.currencySymbol || '$'}${receiptData.total}</span>
          </div>
        </div>
        
        <!-- Payment Info -->
        ${(receiptData.cashAmount && receiptData.cashAmount > 0) ? `
          <div class="payment-info">
            <div class="payment-row">
              <span>Payment Method:</span>
              <span>${receiptData.paymentMethod}</span>
            </div>
            <div class="payment-row">
              <span>Cash Received:</span>
              <span>${receiptData.currencySymbol || '$'}${receiptData.cashAmount}</span>
            </div>
            <div class="payment-row">
              <span>Change:</span>
              <span>${receiptData.currencySymbol || '$'}${receiptData.change || 0}</span>
            </div>
          </div>
        ` : `
          <div class="payment-info">
            <div class="payment-row">
              <span>Payment Method:</span>
              <span>${receiptData.paymentMethod}</span>
            </div>
          </div>
        `}
        
        <!-- Footer -->
        <div class="footer">
          <div style="margin-bottom: 5px;">${currentStoreSettings?.receipt_footer || currentBusinessSettings?.receipt_footer || 'Thank you for your purchase!'}</div>
          <div style="margin-bottom: 5px;">${currentStoreSettings?.return_policy || currentBusinessSettings?.return_policy || 'Returns accepted within 30 days with original receipt'}</div>
          <div class="divider"></div>
          <div>Powered by SCIMS</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Print receipt function
export const printReceipt = (
  receiptData: ReceiptData,
  currentStore: any,
  currentStoreSettings: StoreSettings | null,
  currentBusinessSettings: BusinessSettings | null,
  formatDate: (date: Date) => string,
  formatTime: (date: Date, format?: string) => string
): void => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(
      receiptData,
      currentStore,
      currentStoreSettings,
      currentBusinessSettings,
      formatDate,
      formatTime
    );

    // Write HTML to print window
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Use a more robust approach for printing
    const printAndClose = () => {
      try {
        // Check if window is still available
        if (printWindow && !printWindow.closed) {
          printWindow.print();
          // Close window after a short delay to allow print dialog to appear
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              printWindow.close();
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error during print operation:', error);
        // Try to close window if print fails
        try {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        } catch (closeError) {
          console.error('Error closing print window:', closeError);
        }
      }
    };

    // Wait for content to load then print
    if (printWindow.document.readyState === 'complete') {
      printAndClose();
    } else {
      printWindow.addEventListener('load', printAndClose, { once: true });
      
      // Fallback timeout in case load event doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printAndClose();
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Error printing receipt:', error);
  }
};

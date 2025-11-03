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
  discount?: number;
  discountReason?: string;
  calculatedTotal?: number; // Original calculated total (for variable pricing)
  total: number;
  paymentMethod: string;
  cashAmount?: number;
  cardAmount?: number;
  change?: number;
  currencySymbol?: string; // Add currency symbol for receipt display
  allowVariablePricing?: boolean; // Flag to show variable pricing info
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
  formatTime: (date: Date, format?: string) => string,
  formatCurrency?: (amount: number, currency?: string) => string
): string => {
  // Helper function to format currency
  const formatAmount = (amount: number) => {
    if (formatCurrency) {
      return formatCurrency(amount);
    }
    return `${receiptData.currencySymbol || '$'}${amount.toFixed(2)}`;
  };
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
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          padding: 4px;
          width: 80mm;
          max-width: 80mm;
          background: white;
          color: black;
          line-height: 1.3;
        }
        
        .receipt-container {
          width: 100%;
          max-width: 80mm;
        }
        
        .header {
          text-align: center;
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
          text-transform: uppercase;
          line-height: 1.0;
        }
        
        .store-address {
          font-size: 12px;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .receipt-info {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        
        .receipt-number {
          font-size: 14px;
          margin-bottom: 4px;
          font-weight: bold;
        }
        
        .cashier-info {
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .datetime {
          font-size: 12px;
          color: #666;
        }
        
        .items-section {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
          line-height: 1.3;
          padding: 2px 0;
        }
        
        .item-name {
          flex: 1;
          margin-right: 15px;
          font-weight: 500;
          margin-bottom: 0;
          display: block;
        }
        
        .item-details {
          text-align: right;
          white-space: nowrap;
          font-weight: 500;
        }
        
        .totals-section {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 13px;
          padding: 2px 0;
        }
        
        .total-row.final {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #000;
          padding-top: 4px;
          margin-top: 4px;
        }
        
        .payment-info {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 12px;
          padding: 2px 0;
        }
        
        .footer {
          text-align: center;
          font-size: 11px;
          line-height: 1.3;
          color: #666;
          margin-top: 8px;
        }
        
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 3px;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-size: 12px;
          }
          .receipt-container {
            width: 80mm;
            max-width: 80mm;
          }
          .store-name {
            font-size: 16px;
          }
          .total-row.final {
            font-size: 9px;
          }
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
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
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 5px; background-color: #f5f5f5; padding: 4px 2px;">
            <div style="flex: 1; margin-right: 10px; font-weight: 600; font-size: 11px;">ITEM</div>
            <div style="text-align: right; white-space: nowrap; font-weight: 600; font-size: 11px;">QTY × PRICE = TOTAL</div>
          </div>
          ${receiptData.items?.map((item: { name: string; quantity: number; price: number; }) => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; margin-bottom: 4px; padding-bottom: 4px; font-size: 12px; line-height: 1.4;">
              <div style="flex: 1; margin-right: 10px; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; max-width: 60%;">${item.name}</div>
              <div style="text-align: right; white-space: nowrap; font-weight: 500; flex-shrink: 0;">${item.quantity} × ${formatAmount(item.price)} = ${formatAmount(item.quantity * item.price)}</div>
            </div>
          `).join('') || ''}
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatAmount(receiptData.subtotal)}</span>
          </div>
          ${receiptData.discount && receiptData.discount > 0 ? `
            <div class="total-row" style="color: #28a745; font-weight: bold;">
              <span>Discount${receiptData.discountReason ? ` (${receiptData.discountReason})` : ''}:</span>
              <span>-${formatAmount(receiptData.discount)}</span>
            </div>
          ` : ''}
          ${receiptData.tax > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatAmount(receiptData.tax)}</span>
            </div>
          ` : ''}
          ${(() => {
            // Only show Original Total if variable pricing is enabled AND amounts actually differ
            const calculatedTotal = receiptData.calculatedTotal ?? 0;
            const shouldShowOriginal = receiptData.allowVariablePricing && 
                                     calculatedTotal > 0 &&
                                     Math.abs(calculatedTotal - receiptData.total) > 0.01;
            return shouldShowOriginal ? `
              <div class="total-row" style="color: #666; font-size: 11px; margin-bottom: 2px;">
                <span>Original Total:</span>
                <span>${formatAmount(calculatedTotal)}</span>
              </div>
            ` : '';
          })()}
          <div class="total-row final" style="margin-top: ${(() => {
            const calculatedTotal = receiptData.calculatedTotal ?? 0;
            const shouldShowOriginal = receiptData.allowVariablePricing && 
                                     calculatedTotal > 0 &&
                                     Math.abs(calculatedTotal - receiptData.total) > 0.01;
            return shouldShowOriginal ? '2px' : '4px';
          })()};">
            <span>TOTAL${(() => {
              const calculatedTotal = receiptData.calculatedTotal ?? 0;
              const shouldShowPaid = receiptData.allowVariablePricing && 
                                    calculatedTotal > 0 &&
                                    Math.abs(calculatedTotal - receiptData.total) > 0.01;
              return shouldShowPaid ? ' (Paid)' : '';
            })()}:</span>
            <span>${formatAmount(receiptData.total)}</span>
          </div>
        </div>
        
        <!-- Payment Info -->
        <div class="payment-info">
          <div class="payment-row">
            <span>Payment Method:</span>
            <span>${receiptData.paymentMethod}</span>
          </div>
          ${receiptData.cashAmount && receiptData.cashAmount > 0 ? `
            <div class="payment-row">
              <span>Cash Received:</span>
              <span>${formatAmount(receiptData.cashAmount)}</span>
            </div>
          ` : ''}
          ${receiptData.cardAmount && receiptData.cardAmount > 0 ? `
            <div class="payment-row">
              <span>Card Amount:</span>
              <span>${formatAmount(receiptData.cardAmount)}</span>
            </div>
          ` : ''}
          ${receiptData.change && receiptData.change > 0 ? `
            <div class="payment-row">
              <span>Change:</span>
              <span>${formatAmount(receiptData.change)}</span>
            </div>
          ` : ''}
        </div>
        
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

// Preview receipt function
export const previewReceipt = (
  receiptData: ReceiptData,
  currentStore: any,
  currentStoreSettings: StoreSettings | null,
  currentBusinessSettings: BusinessSettings | null,
  formatDate: (date: Date) => string,
  formatTime: (date: Date, format?: string) => string,
  formatCurrency?: (amount: number, currency?: string) => string
): void => {
  try {
    // Create a new window for preview
    const previewWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
    if (!previewWindow) {
      console.error('Could not open preview window');
      return;
    }

    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(
      receiptData,
      currentStore,
      currentStoreSettings,
      currentBusinessSettings,
      formatDate,
      formatTime,
      formatCurrency
    );

    // Write HTML to preview window
    previewWindow.document.write(receiptHTML);
    previewWindow.document.close();
    previewWindow.document.title = 'Receipt Preview';
  } catch (error) {
    console.error('Error previewing receipt:', error);
  }
};

// Print receipt function
export const printReceipt = (
  receiptData: ReceiptData,
  currentStore: any,
  currentStoreSettings: StoreSettings | null,
  currentBusinessSettings: BusinessSettings | null,
  formatDate: (date: Date) => string,
  formatTime: (date: Date, format?: string) => string,
  formatCurrency?: (amount: number, currency?: string) => string
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
      formatTime,
      formatCurrency
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

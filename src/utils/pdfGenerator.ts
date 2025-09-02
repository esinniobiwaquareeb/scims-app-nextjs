import jsPDF from 'jspdf';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Business {
  name: string;
  phone: string;
  email: string;
  currency: { symbol: string; code: string };
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface OrderData {
  orderNumber: string;
  business: Business;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  total: number;
  notes?: string;
  orderDate: string;
}

export function generateOrderPDF(orderData: OrderData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4));
    } else {
      doc.text(text, x, y);
      return y + (fontSize * 0.4);
    }
  };

  // Helper function to add line
  const addLine = (y: number) => {
    doc.line(margin, y, pageWidth - margin, y);
    return y + 5;
  };

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('ORDER RECEIPT', pageWidth / 2, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;

  // Order Number
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`Order #${orderData.orderNumber}`, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 5;

  // Order Date
  doc.setFontSize(12);
  yPosition = addText(`Date: ${orderData.orderDate}`, margin, yPosition);
  yPosition += 10;

  yPosition = addLine(yPosition);

  // Business Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Business Information', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  yPosition += 5;

  yPosition = addText(`Business: ${orderData.business.name}`, margin, yPosition);
  yPosition = addText(`Phone: ${orderData.business.phone}`, margin, yPosition);
  if (orderData.business.email) {
    yPosition = addText(`Email: ${orderData.business.email}`, margin, yPosition);
  }
  yPosition += 10;

  yPosition = addLine(yPosition);

  // Customer Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Customer Information', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  yPosition += 5;

  yPosition = addText(`Name: ${orderData.customer.name}`, margin, yPosition);
  yPosition = addText(`Phone: ${orderData.customer.phone}`, margin, yPosition);
  if (orderData.customer.email) {
    yPosition = addText(`Email: ${orderData.customer.email}`, margin, yPosition);
  }
  if (orderData.customer.address) {
    yPosition = addText(`Address: ${orderData.customer.address}`, margin, yPosition);
  }
  yPosition += 10;

  yPosition = addLine(yPosition);

  // Order Items
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('Order Items', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;

  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const col1 = margin;
  const col2 = margin + 80;
  const col3 = margin + 120;
  const col4 = margin + 150;

  yPosition = addText('Item', col1, yPosition);
  doc.text('Qty', col2, yPosition - 3);
  doc.text('Price', col3, yPosition - 3);
  doc.text('Total', col4, yPosition - 3);
  yPosition += 5;

  yPosition = addLine(yPosition);

  // Order items
  doc.setFont('helvetica', 'normal');
  orderData.items.forEach((item) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    yPosition = addText(item.product.name, col1, yPosition, 70);
    doc.text(item.quantity.toString(), col2, yPosition - 3);
    doc.text(`${orderData.business.currency.symbol}${item.product.price.toLocaleString()}`, col3, yPosition - 3);
    doc.text(`${orderData.business.currency.symbol}${(item.product.price * item.quantity).toLocaleString()}`, col4, yPosition - 3);
    yPosition += 5;
  });

  yPosition += 10;
  yPosition = addLine(yPosition);

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const totalText = `Total Amount: ${orderData.business.currency.symbol}${orderData.total.toLocaleString()}`;
  yPosition = addText(totalText, col3, yPosition);

  // Order Notes
  if (orderData.notes) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Special Instructions:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    yPosition = addText(orderData.notes, margin, yPosition, pageWidth - 2 * margin);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  yPosition = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your order!', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('This receipt was generated automatically.', pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  doc.save(`order-${orderData.orderNumber}.pdf`);
}

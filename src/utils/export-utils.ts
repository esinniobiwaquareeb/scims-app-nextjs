import { RestockItem } from '@/types';
import { toast } from 'sonner';

/**
 * Export utility functions for CSV and PDF exports
 * Used across the entire project for consistent export functionality
 */

export interface ExportOptions {
  filename?: string;
  storeName?: string;
  businessName?: string;
  includeTimestamp?: boolean;
  dateFormat?: 'short' | 'long' | 'iso';
}

export interface CSVExportOptions extends ExportOptions {
  headers: string[];
  data: unknown[][];
  delimiter?: string;
  quoteFields?: boolean;
}

export interface PDFExportOptions extends ExportOptions {
  title: string;
  subtitle?: string;
  data: unknown[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: Record<string, unknown>) => string;
  }>;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter' | 'Legal';
}

/**
 * Default export options
 */
const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeTimestamp: true,
  dateFormat: 'short'
};

/**
 * Generate filename with store/business context and timestamp
 */
const generateFilename = (
  baseName: string, 
  options: ExportOptions = {}
): string => {
  const { storeName, businessName, includeTimestamp = true } = options;
  
  let filename = baseName;
  
  if (businessName) {
    filename += `-${businessName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }
  
  if (storeName) {
    filename += `-${storeName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }
  
  if (includeTimestamp) {
    const timestamp = new Date().toISOString().split('T')[0];
    filename += `-${timestamp}`;
  }
  
  return filename;
};

/**
 * Format date based on specified format
 */
const formatDate = (date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return dateObj.toISOString();
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Escape CSV field values properly
 */
const escapeCSVField = (value: unknown, quoteFields: boolean = true): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Always quote if contains special characters or if quoteFields is true
  if (quoteFields || stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (options: CSVExportOptions): void => {
  const {
    headers,
    data,
    delimiter = ',',
    quoteFields = true,
    filename = 'export',
    ...exportOptions
  } = options;

  try {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      headers.map(header => escapeCSVField(header, quoteFields)).join(delimiter),
      ...data.map(row => 
        row.map(cell => escapeCSVField(cell, quoteFields)).join(delimiter)
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${generateFilename(filename, exportOptions)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after a short delay to ensure download starts
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);

    toast.success(`Exported ${data.length} records successfully`);
  } catch (error: unknown) {
    console.error('Error exporting to CSV:', error);
    toast.error('Failed to export data');
  }
};

/**
 * Export data to PDF format using jsPDF
 * Note: Requires jsPDF to be installed
 */
export const exportToPDF = async (options: PDFExportOptions): Promise<void> => {
  try {
    // Dynamic import to avoid bundling jsPDF if not needed
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const {
      title,
      subtitle,
      data,
      columns,
      filename = 'export',
      orientation = 'portrait',
      pageSize = 'A4',
      ...exportOptions
    } = options;

    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });

    // Add title and subtitle
    doc.setFontSize(18);
    doc.text(title, 20, 20);
    
    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, 20, 30);
      doc.setTextColor(0, 0, 0);
    }

    // Prepare table data
    const tableData = data.map(item => 
      columns.map(col => {
        if (col.render) {
          return col.render(item as Record<string, unknown>);
        }
        return (item as Record<string, unknown>)[col.key] || '';
      })
    );

    // Add table to PDF
    autoTable(doc, {
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: subtitle ? 40 : 30,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [169, 105, 167], // Brand primary color #A969A7
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // Save PDF
    const finalFilename = generateFilename(filename, exportOptions);
    doc.save(`${finalFilename}.pdf`);

    toast.success(`Exported ${data.length} records to PDF successfully`);
  } catch (error: unknown) {
    console.error('Error exporting to PDF:', error);
    
    if (error instanceof Error && error.message?.includes('jspdf')) {
      toast.error('PDF export requires jsPDF library. Please install jspdf and jspdf-autotable.');
    } else {
      toast.error('Failed to export PDF');
    }
  }
};

/**
 * Quick export functions for common data types
 */

/**
 * Export products to CSV
 */
export const exportProducts = (
  products: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Name', 
    'SKU', 
    'Barcode', 
    'Description', 
    'Price', 
    'Stock Quantity', 
    'Min Stock Level', 
    'Reorder Level',
    'Category', 
    'Supplier', 
    'Brand', 
    'Status',
    'Created Date'
  ];

  const data = products.map(product => [
    product.name as string || '',
    product.sku as string || '',
    product.barcode as string || '',
    product.description as string || '',
    product.price as number || 0,
    product.stock_quantity as number || 0,
    product.min_stock_level as number || 0,
    product.reorder_level as number || 0,
    (product.categories as Record<string, unknown>)?.name as string || '',
    (product.suppliers as Record<string, unknown>)?.name as string || '',
    (product.brands as Record<string, unknown>)?.name as string || '',
    product.is_active ? 'Active' : 'Inactive',
    formatDate(product.created_at as string, options.dateFormat)
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'products',
    ...options
  });
};

/**
 * Export businesses to CSV
 */
export const exportBusinesses = (
  businesses: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Name', 
    'Status', 
    'Subscription Plan', 
    'Total Stores', 
    'Created Date'
  ];

  const data = businesses.map(business => [
    business.name as string || '',
    business.subscription_status as string || 'Unknown',
    (business.subscription_plans as Record<string, unknown>)?.name as string || 'No Plan',
    (business.stores as unknown[])?.length || 0,
    formatDate(business.created_at as string, options.dateFormat)
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'businesses',
    ...options
  });
};

/**
 * Export customers to CSV
 */
export const exportCustomers = (
  customers: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Name', 
    'Phone', 
    'Email', 
    'Address', 
    'Total Purchases', 
    'Total Spent', 
    'Last Purchase', 
    'Created At'
  ];

  const data = customers.map(customer => [
    customer.name as string || '',
    customer.phone as string || '',
    customer.email as string || '',
    customer.address as string || '',
    (customer.totalPurchases as number)?.toString() || '0',
    (customer.totalSpent as number)?.toString() || '0',
    customer.lastPurchase ? formatDate(customer.lastPurchase as string, options.dateFormat) : '',
    formatDate((customer.createdAt || customer.created_at) as string, options.dateFormat)
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'customers',
    ...options
  });
};

/**
 * Export sales data to CSV
 */
export const exportSales = (
  sales: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Receipt Number',
    'Date',
    'Customer',
    'Cashier',
    'Items',
    'Subtotal',
    'Discount',
    'Tax',
    'Total',
    'Payment Method',
    'Status'
  ];

  const data = sales.map(sale => [
    sale.receipt_number as string || 'N/A',
    formatDate((sale.transaction_date || sale.created_at) as string, options.dateFormat),
    (sale.customers as Record<string, unknown>)?.name as string || sale.customer_name as string || 'Walk-in Customer',
    (sale.users as Record<string, unknown>)?.username as string || sale.cashier_name as string || 'Unknown',
    (sale.sale_items as unknown[])?.map((item: unknown) => `${(item as RestockItem).products?.name} (${(item as RestockItem).quantity})`).join('; ') || sale.items_count as string || '',
    sale.subtotal as number || 0,
    sale.discount_amount as number || 0,
    sale.tax_amount as number || 0,
    sale.total_amount as number || 0,
    sale.payment_method as string || 'N/A',
    sale.status as string || 'N/A'
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'sales',
    ...options
  });
};

/**
 * Export suppliers to CSV
 */
export const exportSuppliers = (
  suppliers: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Name',
    'Contact Person',
    'Email',
    'Phone',
    'Address',
    'City',
    'Country',
    'Status',
    'Products Supplied',
    'Total Orders',
    'Total Value'
  ];

  const data = suppliers.map(supplier => [
    supplier.name as string || '',
    supplier.contactPerson as string || '',
    supplier.email as string || '',
    supplier.phone as string || '',
    supplier.address as string || '',
    supplier.city as string || '',
    supplier.country as string || '',
    supplier.status as string || '',
    supplier.productsSupplied as number || 0,
    supplier.totalOrders as number || 0,
    supplier.totalValue as number || 0
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'suppliers',
    ...options
  });
};

/**
 * Export subscription plans to CSV
 */
export const exportSubscriptionPlans = (
  plans: Record<string, unknown>[],
  options: ExportOptions = {}
): void => {
  const headers = [
    'Name',
    'Description',
    'Price',
    'Billing Cycle',
    'Max Stores',
    'Max Users',
    'Features',
    'Status',
    'Popular',
    'Created Date'
  ];

  const data = plans.map(plan => [
    plan.name as string || '',
    plan.description as string || '',
    plan.price as number || 0,
    plan.billing_cycle as string || '',
    (plan.max_stores as number) === -1 ? 'Unlimited' : plan.max_stores as number || 0,
    (plan.max_users as number) === -1 ? 'Unlimited' : plan.max_users as number || 0,
    (plan.features as string[])?.join('; ') || '',
    plan.is_active ? 'Active' : 'Inactive',
    plan.is_popular ? 'Yes' : 'No',
    formatDate(plan.created_at as string, options.dateFormat)
  ]);

  exportToCSV({
    headers,
    data,
    filename: 'subscription-plans',
    ...options
  });
};

/**
 * Export staff/cashier sales to CSV
 */
export const exportStaffSales = (
  sales: Record<string, unknown>[],
  staffName: string,
  options: ExportOptions = {}
): void => {
  const headers = [
    'Receipt',
    'Date',
    'Customer',
    'Amount',
    'Payment Method',
    'Status',
    'Items'
  ];

  const data = sales.map(sale => [
    sale.receipt_number as string || '',
    formatDate(sale.transaction_date as string, options.dateFormat),
    sale.customer_name as string || '',
    sale.total_amount as number || 0,
    sale.payment_method as string || '',
    sale.status as string || '',
    sale.items_count as number || 0
  ]);

  exportToCSV({
    headers,
    data,
    filename: `${staffName.replace(/[^a-zA-Z0-9]/g, '-')}-sales`,
    ...options
  });
};

/**
 * Utility function to check if export is supported
 */
export const isExportSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Blob' in window && 'URL' in window;
};

/**
 * Utility function to get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

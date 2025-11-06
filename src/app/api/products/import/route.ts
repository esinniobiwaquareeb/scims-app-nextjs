import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImportProductRow {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  reorder_level?: number;
  category?: string;
  brand?: string;
  supplier?: string;
  is_active?: boolean;
  is_public?: boolean;
  public_description?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  createdCategories: string[];
  createdBrands: string[];
  createdSuppliers: string[];
}

// Helper function to find or create category
async function findOrCreateCategory(
  categoryName: string,
  businessId: string
): Promise<string | null> {
  if (!categoryName || !categoryName.trim()) return null;

  const trimmedName = categoryName.trim();

  // First, try to find existing category
  const { data: existingCategory } = await supabase
    .from('category')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', trimmedName)
    .eq('is_active', true)
    .single();

  if (existingCategory) {
    return existingCategory.id;
  }

  // Create new category
  const { data: newCategory, error } = await supabase
    .from('category')
    .insert({
      name: trimmedName,
      business_id: businessId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }

  return newCategory.id;
}

// Helper function to find or create brand
async function findOrCreateBrand(
  brandName: string,
  businessId: string
): Promise<string | null> {
  if (!brandName || !brandName.trim()) return null;

  const trimmedName = brandName.trim();

  // First, try to find existing brand
  const { data: existingBrand } = await supabase
    .from('brand')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', trimmedName)
    .eq('is_active', true)
    .single();

  if (existingBrand) {
    return existingBrand.id;
  }

  // Create new brand
  const { data: newBrand, error } = await supabase
    .from('brand')
    .insert({
      name: trimmedName,
      business_id: businessId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating brand:', error);
    return null;
  }

  return newBrand.id;
}

// Helper function to find supplier by name
async function findSupplier(
  supplierName: string,
  businessId: string
): Promise<string | null> {
  if (!supplierName || !supplierName.trim()) return null;

  const trimmedName = supplierName.trim();

  const { data: supplier } = await supabase
    .from('supplier')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', trimmedName)
    .eq('is_active', true)
    .single();

  return supplier?.id || null;
}

// Parse CSV line handling quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());
  return result;
}

// Parse CSV content
function parseCSV(content: string): ImportProductRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  // Find column indices
  const nameIdx = headers.indexOf('name');
  const skuIdx = headers.indexOf('sku');
  const barcodeIdx = headers.indexOf('barcode');
  const descriptionIdx = headers.indexOf('description');
  const priceIdx = headers.indexOf('price');
  const costIdx = headers.indexOf('cost');
  const stockIdx = headers.indexOf('stock_quantity');
  const minStockIdx = headers.indexOf('min_stock_level');
  const reorderIdx = headers.indexOf('reorder_level');
  const categoryIdx = headers.indexOf('category');
  const brandIdx = headers.indexOf('brand');
  const supplierIdx = headers.indexOf('supplier');
  const isActiveIdx = headers.indexOf('is_active');
  const isPublicIdx = headers.indexOf('is_public');
  const publicDescIdx = headers.indexOf('public_description');

  if (nameIdx === -1 || priceIdx === -1) {
    throw new Error('CSV must contain "name" and "price" columns');
  }

  const rows: ImportProductRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
    
    if (values.length === 0 || !values[nameIdx] || !values[nameIdx].trim()) continue; // Skip empty rows

    const price = parseFloat(values[priceIdx] || '0');
    if (isNaN(price) || price < 0) continue; // Skip rows with invalid price

    rows.push({
      name: values[nameIdx].trim(),
      sku: skuIdx >= 0 && values[skuIdx] ? values[skuIdx].trim() : undefined,
      barcode: barcodeIdx >= 0 && values[barcodeIdx] ? values[barcodeIdx].trim() : undefined,
      description: descriptionIdx >= 0 && values[descriptionIdx] ? values[descriptionIdx].trim() : undefined,
      price,
      cost: costIdx >= 0 && values[costIdx] ? parseFloat(values[costIdx] || '0') : undefined,
      stock_quantity: stockIdx >= 0 && values[stockIdx] ? parseInt(values[stockIdx] || '0', 10) : undefined,
      min_stock_level: minStockIdx >= 0 && values[minStockIdx] ? parseInt(values[minStockIdx] || '0', 10) : undefined,
      reorder_level: reorderIdx >= 0 && values[reorderIdx] ? parseInt(values[reorderIdx] || '0', 10) : undefined,
      category: categoryIdx >= 0 && values[categoryIdx] ? values[categoryIdx].trim() : undefined,
      brand: brandIdx >= 0 && values[brandIdx] ? values[brandIdx].trim() : undefined,
      supplier: supplierIdx >= 0 && values[supplierIdx] ? values[supplierIdx].trim() : undefined,
      is_active: isActiveIdx >= 0 ? values[isActiveIdx]?.toLowerCase() === 'true' : true,
      is_public: isPublicIdx >= 0 ? values[isPublicIdx]?.toLowerCase() === 'true' : false,
      public_description: publicDescIdx >= 0 && values[publicDescIdx] ? values[publicDescIdx].trim() : undefined
    });
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const storeId = formData.get('store_id') as string;
    const businessId = formData.get('business_id') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!storeId || !businessId) {
      return NextResponse.json(
        { success: false, error: 'store_id and business_id are required' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse CSV
    let rows: ImportProductRow[];
    try {
      rows = parseCSV(content);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Failed to parse CSV' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid rows found in CSV' },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      totalRows: rows.length,
      imported: 0,
      failed: 0,
      errors: [],
      createdCategories: [],
      createdBrands: [],
      createdSuppliers: []
    };

    // Cache for categories and brands to avoid duplicate lookups
    const categoryCache = new Map<string, string | null>();
    const brandCache = new Map<string, string | null>();
    const supplierCache = new Map<string, string | null>();

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Validate required fields
        if (!row.name || !row.name.trim()) {
          result.errors.push({ row: rowNumber, error: 'Name is required' });
          result.failed++;
          continue;
        }

        if (isNaN(row.price) || row.price < 0) {
          result.errors.push({ row: rowNumber, error: 'Valid price is required' });
          result.failed++;
          continue;
        }

        // Get or create category
        let categoryId: string | null = null;
        if (row.category) {
          if (!categoryCache.has(row.category)) {
            const catId = await findOrCreateCategory(row.category, businessId);
            categoryCache.set(row.category, catId);
            if (catId) {
              result.createdCategories.push(row.category);
            }
          }
          categoryId = categoryCache.get(row.category) || null;
        }

        // Get or create brand
        let brandId: string | null = null;
        if (row.brand) {
          if (!brandCache.has(row.brand)) {
            const brId = await findOrCreateBrand(row.brand, businessId);
            brandCache.set(row.brand, brId);
            if (brId) {
              result.createdBrands.push(row.brand);
            }
          }
          brandId = brandCache.get(row.brand) || null;
        }

        // Find supplier (don't auto-create suppliers)
        let supplierId: string | null = null;
        if (row.supplier) {
          if (!supplierCache.has(row.supplier)) {
            const supId = await findSupplier(row.supplier, businessId);
            supplierCache.set(row.supplier, supId);
          }
          supplierId = supplierCache.get(row.supplier) || null;
        }

        // Check for duplicate SKU or barcode in the same store
        if (row.sku || row.barcode) {
          let duplicateQuery = supabase
            .from('product')
            .select('id, name')
            .eq('store_id', storeId)
            .eq('is_active', true);

          if (row.sku) {
            duplicateQuery = duplicateQuery.eq('sku', row.sku);
          } else if (row.barcode) {
            duplicateQuery = duplicateQuery.eq('barcode', row.barcode);
          }

          const { data: duplicates } = await duplicateQuery;

          if (duplicates && duplicates.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: `Duplicate product found: ${duplicates[0].name}`
            });
            result.failed++;
            continue;
          }
        }

        // Create product
        const productData = {
          store_id: storeId,
          business_id: businessId,
          name: row.name.trim(),
          price: row.price,
          cost: row.cost || 0,
          sku: row.sku?.trim() || '',
          barcode: row.barcode?.trim() || '',
          description: row.description?.trim() || '',
          public_description: row.public_description?.trim() || '',
          stock_quantity: row.stock_quantity || 0,
          min_stock_level: row.min_stock_level || 0,
          reorder_level: row.reorder_level || 0,
          category_id: categoryId,
          supplier_id: supplierId,
          brand_id: brandId,
          is_active: row.is_active !== false,
          is_public: row.is_public || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: productError } = await supabase
          .from('product')
          .insert(productData);

        if (productError) {
          result.errors.push({
            row: rowNumber,
            error: productError.message || 'Failed to create product'
          });
          result.failed++;
        } else {
          result.imported++;
        }
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.failed++;
      }
    }

    result.success = result.failed === 0;

    return NextResponse.json({
      success: result.success,
      result
    });

  } catch (error) {
    console.error('Error in product import:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


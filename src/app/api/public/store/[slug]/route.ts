import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Store slug is required' },
        { status: 400 }
      );
    }

    // Get business by slug
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select(`
        *,
        business_setting(*),
        currency(*),
        language(*),
        country(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if public store is enabled
    const storeSettings = business.business_setting;
    if (!storeSettings?.enable_public_store) {
      return NextResponse.json(
        { success: false, error: 'Public store is not enabled for this business' },
        { status: 403 }
      );
    }

    // Get stores for this business
    const { data: stores, error: storesError } = await supabase
      .from('store')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true);

    if (storesError) {
      console.error('Error fetching stores:', storesError);
    }

    // Get public products from all stores with unique products
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        *,
        category(name),
        brand(name),
        store(name)
      `)
      .eq('business_id', business.id)
      .eq('is_public', true)
      .eq('is_active', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Ensure unique products (in case same product exists in multiple stores)
    const uniqueProducts = products ? products.reduce((acc: typeof products, product: typeof products[0]) => {
      const existingProduct = acc.find(p => p.id === product.id);
      if (!existingProduct) {
        acc.push(product);
      } else {
        // If product exists in multiple stores, combine stock quantities
        existingProduct.stock_quantity += product.stock_quantity;
        // Update store info to show it's available in multiple stores
        if (!existingProduct.store_names) {
          existingProduct.store_names = [existingProduct.store?.name];
        }
        if (product.store?.name && !existingProduct.store_names.includes(product.store.name)) {
          existingProduct.store_names.push(product.store.name);
        }
      }
      return acc;
    }, []) : [];

    // Get categories for filtering
    const { data: categories, error: categoriesError } = await supabase
      .from('category')
      .select('id, name')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        email: business.email,
        phone: business.phone,
        address: business.address,
        website: business.website,
        slug: business.slug,
        currency: business.currency,
        language: business.language,
        country: business.country,
        settings: {
          enable_public_store: storeSettings?.enable_public_store,
          store_theme: storeSettings?.store_theme || 'default',
          store_banner_url: storeSettings?.store_banner_url,
          store_description: storeSettings?.store_description,
          whatsapp_phone: storeSettings?.whatsapp_phone || business.phone,
          whatsapp_message_template: storeSettings?.whatsapp_message_template
        }
      },
      stores: stores || [],
      products: uniqueProducts,
      categories: categories || []
    });

  } catch (error) {
    console.error('Error fetching store data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store data' },
      { status: 500 }
    );
  }
}

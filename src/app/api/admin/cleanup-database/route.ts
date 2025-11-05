import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { cookies } from 'next/headers';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Demo business ID from sample data
const DEMO_BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440062';
const DEMO_STORE_ID = '550e8400-e29b-41d4-a716-446655440072';

export async function POST() {
  try {
    // Verify authentication and superadmin role
    const cookieStore = await cookies();
    const userId = cookieStore.get('scims_auth_token')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.', results: {} },
        { status: 401 }
      );
    }

    // Get user to verify role
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !user || user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only superadmin can perform this action.', results: {} },
        { status: 403 }
      );
    }

    // Get demo business IDs to preserve
    const { data: demoBusiness, error: demoBusinessError } = await supabase
      .from('business')
      .select('id')
      .or(`id.eq.${DEMO_BUSINESS_ID},name.ilike.%demo%`)
      .eq('is_active', true);

    if (demoBusinessError) {
      console.error('Error fetching demo business:', demoBusinessError);
    }

    const demoBusinessIds = demoBusiness?.map(b => b.id) || [DEMO_BUSINESS_ID];

    // Get demo store IDs to preserve
    const { data: demoStores, error: demoStoresError } = await supabase
      .from('store')
      .select('id')
      .in('business_id', demoBusinessIds);

    if (demoStoresError) {
      console.error('Error fetching demo stores:', demoStoresError);
    }

    const demoStoreIds = demoStores?.map(s => s.id) || [DEMO_STORE_ID];

    // Get all superadmin user IDs to preserve (never delete these)
    const { data: superadminUsers } = await supabase
      .from('user')
      .select('id')
      .eq('role', 'superadmin');
    
    const superadminUserIds = (superadminUsers || []).map((u: { id: string }) => u.id);

    // Start cleanup process - order matters due to foreign key constraints
    const cleanupResults: Record<string, { deleted: number; error?: string }> = {};

    // Helper function to delete records excluding demo data
    const deleteExcludingDemo = async (
      table: string,
      businessField: string | null,
      storeField: string | null = null
    ): Promise<{ deleted: number; error?: string }> => {
      try {
        // Get all records first
        const selectFields = 'id' + (businessField ? `, ${businessField}` : '') + (storeField ? `, ${storeField}` : '');
        const { data: allRecords, error: selectError } = await supabase
          .from(table)
          .select(selectFields);

        if (selectError) {
          return { deleted: 0, error: selectError.message };
        }

        if (!allRecords || allRecords.length === 0) {
          return { deleted: 0 };
        }

        // Filter out demo records
        const recordsToDelete = (allRecords as unknown as Array<Record<string, unknown>>).filter((record) => {
          // Exclude if business_id matches demo business
          if (businessField && record[businessField] && typeof record[businessField] === 'string' && demoBusinessIds.includes(record[businessField] as string)) {
            return false;
          }
          // Exclude if store_id matches demo store
          if (storeField && record[storeField] && typeof record[storeField] === 'string' && demoStoreIds.includes(record[storeField] as string)) {
            return false;
          }
          return true;
        });

        if (recordsToDelete.length === 0) {
          return { deleted: 0 };
        }

        const ids = recordsToDelete.map((r) => r.id as string);
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .in('id', ids);

        if (deleteError) {
          return { deleted: 0, error: deleteError.message };
        }

        return { deleted: ids.length };
      } catch (error: unknown) {
        return {
          deleted: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    };

    // Helper to delete by business_id (simpler case)
    const deleteByBusiness = async (table: string, businessField: string = 'business_id') => {
      return deleteExcludingDemo(table, businessField, null);
    };

    // Helper to delete by store_id
    const deleteByStore = async (table: string, storeField: string = 'store_id') => {
      return deleteExcludingDemo(table, null, storeField);
    };

    // 1. Delete usage tracking - need to get via coupon/promotion business_id
    // First get all coupons and filter
    const { data: allCoupons } = await supabase.from('coupon').select('id, business_id');
    const nonDemoCoupons = (allCoupons || []).filter((c: { id: string; business_id: string }) => 
      !demoBusinessIds.includes(c.business_id)
    );
    const nonDemoCouponIds = nonDemoCoupons.map((c: { id: string }) => c.id);
    
    if (nonDemoCouponIds.length > 0) {
      // Get count before deletion
      const { count: couponUsageCount } = await supabase
        .from('coupon_usage')
        .select('id', { count: 'exact', head: true })
        .in('coupon_id', nonDemoCouponIds);
      
      const { error: couponUsageError } = await supabase
        .from('coupon_usage')
        .delete()
        .in('coupon_id', nonDemoCouponIds);
      cleanupResults.coupon_usage = { deleted: couponUsageCount || 0, error: couponUsageError?.message };
    } else {
      cleanupResults.coupon_usage = { deleted: 0 };
    }

    // Get all promotions and filter
    const { data: allPromotions } = await supabase.from('promotion').select('id, business_id');
    const nonDemoPromotions = (allPromotions || []).filter((p: { id: string; business_id: string }) => 
      !demoBusinessIds.includes(p.business_id)
    );
    const nonDemoPromotionIds = nonDemoPromotions.map((p: { id: string }) => p.id);
    
    if (nonDemoPromotionIds.length > 0) {
      // Get count before deletion
      const { count: promotionUsageCount } = await supabase
        .from('promotion_usage')
        .select('id', { count: 'exact', head: true })
        .in('promotion_id', nonDemoPromotionIds);
      
      const { error: promotionUsageError } = await supabase
        .from('promotion_usage')
        .delete()
        .in('promotion_id', nonDemoPromotionIds);
      cleanupResults.promotion_usage = { deleted: promotionUsageCount || 0, error: promotionUsageError?.message };
    } else {
      cleanupResults.promotion_usage = { deleted: 0 };
    }

    // 2. Delete sales and related items (sale_item cascades, but we'll track)
    cleanupResults.sales = await deleteByStore('sale', 'store_id');
    // Note: sale_item is deleted via CASCADE when sales are deleted

    // 3. Delete supply returns first (supply_return_item references supply_return)
    cleanupResults.supply_returns = await deleteByStore('supply_return', 'store_id');
    
    // 4. Delete supply return items (cascade should handle this, but clean explicitly)
    // Get supply_return IDs for non-demo stores, then delete items
    const { data: allSupplyReturns } = await supabase.from('supply_return').select('id, store_id');
    const nonDemoSupplyReturns = (allSupplyReturns || []).filter((sr: { id: string; store_id: string }) => 
      !demoStoreIds.includes(sr.store_id)
    );
    const nonDemoSupplyReturnIds = nonDemoSupplyReturns.map((sr: { id: string }) => sr.id);
    if (nonDemoSupplyReturnIds.length > 0) {
      // Get count before deletion
      const { count: supplyReturnItemsCount } = await supabase
        .from('supply_return_item')
        .select('id', { count: 'exact', head: true })
        .in('supply_return_id', nonDemoSupplyReturnIds);
      
      const { error: supplyReturnItemsError } = await supabase
        .from('supply_return_item')
        .delete()
        .in('supply_return_id', nonDemoSupplyReturnIds);
      cleanupResults.supply_return_items = { deleted: supplyReturnItemsCount || 0, error: supplyReturnItemsError?.message };
    } else {
      cleanupResults.supply_return_items = { deleted: 0 };
    }
    
    // 5. Delete supply orders first (supply_order_item references supply_order)
    cleanupResults.supply_orders = await deleteByStore('supply_order', 'store_id');
    
    // 6. Delete supply order items (cascade should handle this, but clean explicitly)
    // Get supply_order IDs for non-demo stores, then delete items
    const { data: allSupplyOrders } = await supabase.from('supply_order').select('id, store_id');
    const nonDemoSupplyOrders = (allSupplyOrders || []).filter((so: { id: string; store_id: string }) => 
      !demoStoreIds.includes(so.store_id)
    );
    const nonDemoSupplyOrderIds = nonDemoSupplyOrders.map((so: { id: string }) => so.id);
    if (nonDemoSupplyOrderIds.length > 0) {
      // Get count before deletion
      const { count: supplyOrderItemsCount } = await supabase
        .from('supply_order_item')
        .select('id', { count: 'exact', head: true })
        .in('supply_order_id', nonDemoSupplyOrderIds);
      
      const { error: supplyOrderItemsError } = await supabase
        .from('supply_order_item')
        .delete()
        .in('supply_order_id', nonDemoSupplyOrderIds);
      cleanupResults.supply_order_items = { deleted: supplyOrderItemsCount || 0, error: supplyOrderItemsError?.message };
    } else {
      cleanupResults.supply_order_items = { deleted: 0 };
    }
    
    // 7. Delete supply payments (references supply_order)
    if (nonDemoSupplyOrderIds.length > 0) {
      // Get count before deletion
      const { count: supplyPaymentsCount } = await supabase
        .from('supply_payment')
        .select('id', { count: 'exact', head: true })
        .in('supply_order_id', nonDemoSupplyOrderIds);
      
      const { error: supplyPaymentsError } = await supabase
        .from('supply_payment')
        .delete()
        .in('supply_order_id', nonDemoSupplyOrderIds);
      cleanupResults.supply_payments = { deleted: supplyPaymentsCount || 0, error: supplyPaymentsError?.message };
    } else {
      cleanupResults.supply_payments = { deleted: 0 };
    }

    // 8. Delete restock orders first (restock_item references restock_order)
    cleanupResults.restock_orders = await deleteByStore('restock_order', 'store_id');
    
    // 9. Delete restock items (cascade should handle this, but clean explicitly)
    // Get restock_order IDs for non-demo stores, then delete items
    const { data: allRestockOrders } = await supabase.from('restock_order').select('id, store_id');
    const nonDemoRestockOrders = (allRestockOrders || []).filter((ro: { id: string; store_id: string }) => 
      !demoStoreIds.includes(ro.store_id)
    );
    const nonDemoRestockOrderIds = nonDemoRestockOrders.map((ro: { id: string }) => ro.id);
    if (nonDemoRestockOrderIds.length > 0) {
      // Get count before deletion
      const { count: restockItemsCount } = await supabase
        .from('restock_item')
        .select('id', { count: 'exact', head: true })
        .in('restock_order_id', nonDemoRestockOrderIds);
      
      const { error: restockItemsError } = await supabase
        .from('restock_item')
        .delete()
        .in('restock_order_id', nonDemoRestockOrderIds);
      cleanupResults.restock_items = { deleted: restockItemsCount || 0, error: restockItemsError?.message };
    } else {
      cleanupResults.restock_items = { deleted: 0 };
    }

    // 10. Delete public orders
    cleanupResults.public_orders = await deleteByBusiness('public_order', 'business_id');

    // 11. Delete saved carts
    cleanupResults.saved_carts = await deleteByStore('saved_cart', 'store_id');

    // 12. Delete coupons and promotions
    cleanupResults.coupons = await deleteByBusiness('coupon', 'business_id');
    cleanupResults.promotions = await deleteByBusiness('promotion', 'business_id');

    // 13. Delete products (before categories/brands/suppliers as they reference products)
    cleanupResults.products = await deleteByBusiness('product', 'business_id');

    // 14. Delete categories
    cleanupResults.categories = await deleteByBusiness('category', 'business_id');

    // 15. Delete brands
    cleanupResults.brands = await deleteByBusiness('brand', 'business_id');

    // 16. Delete suppliers
    cleanupResults.suppliers = await deleteByBusiness('supplier', 'business_id');

    // 17. Delete customers
    cleanupResults.customers = await deleteByStore('customer', 'store_id');

    // 18. Delete notifications
    cleanupResults.notifications = await deleteByBusiness('notification', 'business_id');

    // 19. Delete user roles (business-specific roles) - but preserve superadmin user roles
    try {
      const { data: allUserRoles } = await supabase.from('user_role').select('id, user_id, business_id');
      const userRolesToDelete = (allUserRoles || []).filter((ur: { id: string; user_id: string; business_id: string }) => 
        !demoBusinessIds.includes(ur.business_id) && !superadminUserIds.includes(ur.user_id)
      );
      
      if (userRolesToDelete.length > 0) {
        const userRoleIds = userRolesToDelete.map((ur: { id: string }) => ur.id);
        const { error: userRolesError } = await supabase
          .from('user_role')
          .delete()
          .in('id', userRoleIds);
        cleanupResults.user_roles = { deleted: userRoleIds.length, error: userRolesError?.message };
      } else {
        cleanupResults.user_roles = { deleted: 0 };
      }
    } catch (error: unknown) {
      cleanupResults.user_roles = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // 20. Delete roles (business-specific roles)
    cleanupResults.roles = await deleteByBusiness('role', 'business_id');

    // 21. Delete user business roles - but preserve superadmin user roles
    try {
      const { data: allUserBusinessRoles } = await supabase.from('user_business_role').select('id, user_id, business_id');
      const userBusinessRolesToDelete = (allUserBusinessRoles || []).filter((ubr: { id: string; user_id: string; business_id: string | null }) => 
        (!ubr.business_id || !demoBusinessIds.includes(ubr.business_id)) && !superadminUserIds.includes(ubr.user_id)
      );
      
      if (userBusinessRolesToDelete.length > 0) {
        const userBusinessRoleIds = userBusinessRolesToDelete.map((ubr: { id: string }) => ubr.id);
        const { error: userBusinessRolesError } = await supabase
          .from('user_business_role')
          .delete()
          .in('id', userBusinessRoleIds);
        cleanupResults.user_business_roles = { deleted: userBusinessRoleIds.length, error: userBusinessRolesError?.message };
      } else {
        cleanupResults.user_business_roles = { deleted: 0 };
      }
    } catch (error: unknown) {
      cleanupResults.user_business_roles = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // 22. Delete store settings
    cleanupResults.store_settings = await deleteByStore('store_setting', 'store_id');

    // 23. Delete stores (excluding demo stores)
    try {
      const { data: allStores } = await supabase.from('store').select('id, business_id');
      const storesToDelete = (allStores || []).filter((s: { id: string; business_id: string }) => 
        !demoStoreIds.includes(s.id) && !demoBusinessIds.includes(s.business_id)
      );

      if (storesToDelete.length > 0) {
        const storeIds = storesToDelete.map((s: { id: string }) => s.id);
        const { error: storesError } = await supabase
          .from('store')
          .delete()
          .in('id', storeIds);
        cleanupResults.stores = { deleted: storeIds.length, error: storesError?.message };
      } else {
        cleanupResults.stores = { deleted: 0 };
      }
    } catch (error: unknown) {
      cleanupResults.stores = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // 24. Delete business settings
    cleanupResults.business_settings = await deleteByBusiness('business_setting', 'business_id');

    // 25. Delete activity logs
    cleanupResults.activity_logs = await deleteByBusiness('activity_log', 'business_id');

    // 26. Delete users (excluding demo users and superadmin)
    try {
      // Get all users first
      const { data: allUsers } = await supabase.from('user').select('id, is_demo, role');
      
      // Filter to only delete non-demo, non-superadmin users
      // Double-check: ensure superadmin users are never deleted
      const usersToDelete = (allUsers || []).filter((u: { id: string; is_demo: boolean; role: string }) => {
        // Never delete superadmin users
        if (u.role === 'superadmin' || superadminUserIds.includes(u.id)) {
          return false;
        }
        // Never delete demo users
        if (u.is_demo === true) {
          return false;
        }
        return true;
      });

      if (usersToDelete.length > 0) {
        const userIds = usersToDelete.map((u: { id: string }) => u.id);
        
        // Final safety check: ensure no superadmin IDs are in the deletion list
        const safeUserIds = userIds.filter(id => !superadminUserIds.includes(id));
        
        if (safeUserIds.length > 0) {
          const { error: usersError } = await supabase
            .from('user')
            .delete()
            .in('id', safeUserIds);
          cleanupResults.users = { deleted: safeUserIds.length, error: usersError?.message };
        } else {
          cleanupResults.users = { deleted: 0 };
        }
      } else {
        cleanupResults.users = { deleted: 0 };
      }
    } catch (error: unknown) {
      cleanupResults.users = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // 27. Delete businesses (excluding demo business) - LAST because everything depends on it
    try {
      const { data: allBusinesses } = await supabase.from('business').select('id');
      const businessesToDelete = (allBusinesses || []).filter((b: { id: string }) => 
        !demoBusinessIds.includes(b.id)
      );

      if (businessesToDelete.length > 0) {
        const businessIds = businessesToDelete.map((b: { id: string }) => b.id);
        const { error: businessesError } = await supabase
          .from('business')
          .delete()
          .in('id', businessIds);
        cleanupResults.businesses = { deleted: businessIds.length, error: businessesError?.message };
      } else {
        cleanupResults.businesses = { deleted: 0 };
      }
    } catch (error: unknown) {
      cleanupResults.businesses = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Check if there were any errors
    const hasErrors = Object.values(cleanupResults).some(result => result.error);
    const totalDeleted = Object.values(cleanupResults).reduce((sum, result) => sum + (result.deleted || 0), 0);
    const tablesProcessed = Object.keys(cleanupResults).length;

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors 
        ? `Cleanup completed with some errors. Deleted ${totalDeleted} records across ${tablesProcessed} tables. Check details for more information.`
        : `Database cleanup completed successfully. Deleted ${totalDeleted} records across ${tablesProcessed} tables. All non-demo data has been removed.`,
      results: cleanupResults,
      summary: {
        totalRecordsDeleted: totalDeleted,
        tablesProcessed,
        hasErrors
      }
    });

  } catch (error: unknown) {
    console.error('Database cleanup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup database',
        details: error instanceof Error ? error.stack : undefined,
        results: {} // Ensure results is always present
      },
      { status: 500 }
    );
  }
}

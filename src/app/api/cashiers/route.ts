import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const storeId = searchParams.get('store_id');

    if (!businessId && !storeId) {
      return NextResponse.json(
        { error: 'Either business_id or store_id is required' },
        { status: 400 }
      );
    }

    // First, let's get all users that are cashiers and have a business role
    let userRolesQuery = supabase
      .from('user_business_role')
      .select(`
        user_id,
        store_id
      `)
      .eq('business_id', businessId)
      .not('user_id', 'is', null);

    if (storeId) {
      userRolesQuery = userRolesQuery.eq('store_id', storeId);
    }

    const { data: userRoles, error: rolesError } = await userRolesQuery;

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return NextResponse.json(
        { error: 'Failed to fetch user roles' },
        { status: 500 }
      );
    }

    console.log('User roles found:', userRoles?.length || 0);
    console.log('Business ID:', businessId);

    if (!userRoles || userRoles.length === 0) {
      console.log('No user roles found for business:', businessId);
      return NextResponse.json({ cashiers: [] });
    }

    // Get all users that are cashiers
    const userIds = userRoles.map((role: { user_id: string }) => role.user_id);
    console.log('User IDs found:', userIds);
    
    if (userIds.length === 0) {
      console.log('No user IDs found, returning empty cashiers list');
      return NextResponse.json({ cashiers: [] });
    }
    
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .in('id', userIds)
      .eq('role', 'cashier')
      .order('username', { ascending: true });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get sales summaries for these users
    const { data: salesRows, error: salesError } = await supabase
      .from('sale')
      .select('cashier_id,total_amount')
      .in('cashier_id', userIds);

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    }

    const cashierIdToStats: Record<string, { totalSales: number; transactionCount: number }> = {};
    (salesRows || []).forEach((row: { cashier_id: string; total_amount: string | number }) => {
      const cid = row.cashier_id;
      if (!cashierIdToStats[cid]) cashierIdToStats[cid] = { totalSales: 0, transactionCount: 0 };
      cashierIdToStats[cid].totalSales += Number(row.total_amount || 0);
      cashierIdToStats[cid].transactionCount += 1;
    });

    // Get store information for all store IDs
    const storeIds = userRoles
      .map((role: { store_id?: string }) => role.store_id)
      .filter((id: string | undefined) => id) as string[];
    
    const storeInfo: Record<string, { id: string; name: string }> = {};
    if (storeIds.length > 0) {
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select('id, name')
        .in('id', storeIds);
      
      if (!storesError && stores) {
        stores.forEach((store: { id: string; name: string }) => {
          storeInfo[store.id] = store;
        });
      }
    }

    // Combine the data
    const transformedCashiers = (users || []).map((user: { 
      id: string; 
      name: string; 
      username: string; 
      email: string; 
      phone?: string; 
      is_active: boolean; 
      role: string; 
      created_at: string; 
      last_login?: string; 
    }) => {
      const userRole = userRoles.find((role: { user_id: string; store_id?: string }) => role.user_id === user.id);
      const stats = cashierIdToStats[user.id] || { totalSales: 0, transactionCount: 0 };
      const storeName = userRole?.store_id ? storeInfo[userRole.store_id]?.name : undefined;
      
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        store_id: userRole?.store_id,
        storeName: storeName,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        totalSales: stats.totalSales,
        transactionCount: stats.transactionCount
      };
    });

    return NextResponse.json({ cashiers: transformedCashiers });
  } catch (error) {
    console.error('Error fetching cashiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, email, phone, store_id, business_id } = body;
    
    console.log('Creating cashier with data:', { name, username, email, phone, store_id, business_id });

    if (!name || !username || !business_id) {
      return NextResponse.json(
        { error: 'Name, username, and business_id are required' },
        { status: 400 }
      );
    }

    // Email is optional, but if provided, it should not be empty
    if (email && email.trim() === '') {
      return NextResponse.json(
        { error: 'Email cannot be empty if provided' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Use default password "123456"
    const defaultPassword = "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Create user account
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        username: username.toLowerCase(),
        email: email && email.trim() !== '' ? email.trim() : null,
        password_hash: passwordHash,
        name,
        phone: phone && phone.trim() !== '' ? phone.trim() : null,
        role: 'cashier',
        is_active: true,
        is_demo: false,
        email_verified: true
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user-business role relationship
    const { error: roleError } = await supabase
      .from('user_business_role')
      .insert({
        user_id: user.id,
        business_id,
        store_id: store_id || null
      });

    if (roleError) {
      console.error('Error creating user-business role:', roleError);
      // Clean up the created user
      await supabase.from('user').delete().eq('id', user.id);
      return NextResponse.json(
        { error: 'Failed to create user-business role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        default_password: defaultPassword
      }
    });
  } catch (error) {
    console.error('Error creating cashier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

// GET - Fetch staff with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const business_id = searchParams.get('business_id');
    const store_id = searchParams.get('store_id');
    const role = searchParams.get('role');
    const is_active = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Step 1: Get all user_business_role for the business/store
    let userRolesQuery = supabase
      .from('user_business_role')
      .select(`
        user_id,
        store_id,
        store!store_id(
          id,
          name
        )
      `);

    if (business_id) userRolesQuery = userRolesQuery.eq('business_id', business_id);
    if (store_id) userRolesQuery = userRolesQuery.eq('store_id', store_id);

    const { data: userRoles, error: rolesError } = await userRolesQuery;
    if (rolesError) throw rolesError;

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json({
        success: true,
        staff: [],
        pagination: { limit, offset, total: 0 }
      });
    }

    // Step 2: Get all users for the business/store
    const userIds = userRoles.map((role: { user_id: string }) => role.user_id);
    let usersQuery = supabase
      .from('user')
      .select('*')
      .in('id', userIds)
      .order('username', { ascending: true });

    if (role) usersQuery = usersQuery.eq('role', role);
    if (is_active !== null) usersQuery = usersQuery.eq('is_active', is_active === 'true');

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) throw usersError;

    // Get sales summaries for these users
    const { data: salesRows, error: salesError } = await supabase
      .from('sale')
      .select('cashier_id,total_amount')
      .in('cashier_id', userIds);

    if (salesError) {
      console.error('Error fetching staff sales:', salesError);
      // Continue without sales data if there's an error
    }

    const userIdToStats: Record<string, { totalSales: number; transactionCount: number }> = {};
    (salesRows || []).forEach((row: { cashier_id: string; total_amount: string | number }) => {
      const uid = row.cashier_id;
      if (!userIdToStats[uid]) userIdToStats[uid] = { totalSales: 0, transactionCount: 0 };
      userIdToStats[uid].totalSales += Number(row.total_amount || 0);
      userIdToStats[uid].transactionCount += 1;
    });

    // Step 3: Combine the data in JavaScript
    const transformedStaff = (users || []).map((user: {
      id: string;
      name: string;
      username: string;
      email: string;
      phone: string;
      is_active: boolean;
      role: string;
      created_at: string;
      last_login: string;
    }) => {
      const userRole = userRoles.find((role: { user_id: string; store_id?: string; store?: Array<{ name: string }> }) => role.user_id === user.id);
      const stats = userIdToStats[user.id] || { totalSales: 0, transactionCount: 0 };
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        store_id: userRole?.store_id,
        storeName: userRole?.store?.[0]?.name,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        totalSales: stats.totalSales,
        transactionCount: stats.transactionCount
      };
    });

    // Apply pagination
    const paginatedStaff = transformedStaff.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      staff: paginatedStaff,
      pagination: {
        limit,
        offset,
        total: transformedStaff.length
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch staff' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const staffData = await request.json();

    // Use default password "123456"
    const defaultPassword = "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Step 1: Create the user
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        username: staffData.username,
        email: staffData.email && staffData.email.trim() !== '' ? staffData.email : null,
        password_hash: passwordHash,
        name: staffData.name,
        phone: staffData.phone && staffData.phone.trim() !== '' ? staffData.phone : null,
        role: staffData.role,
        is_active: staffData.is_active
      })
      .select()
      .single();

    if (userError) throw userError;

    // Step 2: Create the user-business role relationship
    const { error: roleError } = await supabase
      .from('user_business_role')
      .insert({
        user_id: user.id,
        business_id: staffData.business_id,
        store_id: staffData.store_id
      });

    if (roleError) throw roleError;

    return NextResponse.json({ 
      success: true, 
      user,
      default_password: defaultPassword
    });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create staff member' 
      },
      { status: 500 }
    );
  }
}



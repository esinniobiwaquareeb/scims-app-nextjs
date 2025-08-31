import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const storeId = searchParams.get('store_id');
    const userId = searchParams.get('user_id');
    const moduleFilter = searchParams.get('module');
    const action = searchParams.get('action');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userRole = searchParams.get('user_role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // For super admin, business_id is optional - they can see all logs
    if (!businessId && userRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Business ID is required for non-super admin users' },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user:user_id(id, username, name, role),
        business:business_id(id, name),
        store:store_id(id, name)
      `);

    // For super admin, show all logs; for others, filter by business
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    // Apply filters
    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (moduleFilter && moduleFilter !== 'All') {
      query = query.eq('category', moduleFilter);
    }

    if (action && action !== 'All') {
      query = query.eq('activity_type', action);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply search filter
    if (search) {
      query = query.or(`description.ilike.%${search}%,activity_type.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // Get total count for pagination
    const countQuery = supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true });

    // Apply the same filters to count query
    if (businessId) countQuery.eq('business_id', businessId);
    if (storeId) countQuery.eq('store_id', storeId);
    if (userId) countQuery.eq('user_id', userId);
    if (moduleFilter && moduleFilter !== 'All') countQuery.eq('category', moduleFilter);
    if (action && action !== 'All') countQuery.eq('activity_type', action);
    if (startDate) countQuery.gte('created_at', startDate);
    if (endDate) countQuery.lte('created_at', endDate);
    if (search) countQuery.or(`description.ilike.%${search}%,activity_type.ilike.%${search}%,category.ilike.%${search}%`);

    const { count } = await countQuery;

    // Get logs with ordering and pagination
    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedLogs = logs?.map((log: {
      id: string;
      created_at: string;
      user: { name: string; username: string; role?: string } | null;
      activity_type: string;
      category: string;
      description: string;
      metadata?: { severity?: string };
      business: { name: string } | null;
      store: { name: string } | null;
      ip_address?: string;
    }) => {
      // Ensure created_at is properly converted to Date
      let timestamp: Date;
      try {
        timestamp = new Date(log.created_at);
        // Check if the date is valid
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid date from database:', log.created_at);
          timestamp = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.error('Error parsing date:', log.created_at, error);
        timestamp = new Date(); // Fallback to current date
      }

      return {
        id: log.id,
        timestamp,
        userName: log.user?.name || log.user?.username || 'Unknown User',
        userRole: log.user?.role || 'Unknown',
        action: log.activity_type || 'unknown',
        module: log.category || 'Unknown',
        description: log.description || 'No description',
        severity: log.metadata?.severity || 'medium',
        businessName: log.business?.name,
        storeName: log.store?.name,
        ipAddress: log.ip_address,
        metadata: log.metadata
      };
    }) || [];

    return NextResponse.json({
      success: true,
      logs: transformedLogs,
      total: transformedLogs.length,
      pagination: {
        page,
        limit,
        total: count || transformedLogs.length,
        totalPages: Math.ceil((count || transformedLogs.length) / limit)
      }
    });

  } catch (error) {
    console.error('Error in activity logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const storeId = searchParams.get('store_id');
    const userRole = searchParams.get('user_role');

    // For super admin, business_id is optional - they can clear all logs
    if (!businessId && userRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Business ID is required for non-super admin users' },
        { status: 400 }
      );
    }

    // Build the delete query
    let query = supabase
      .from('activity_log')
      .delete();

    // For super admin, can clear all logs; for others, filter by business
    if (businessId) {
      query = query.eq('business_id', businessId);
    } else if (userRole === 'superadmin') {
      // For super admin without business_id, we need to add a WHERE clause
      // Use a condition that's always true to satisfy Supabase's requirement
      // We'll use a simple text comparison that's always true
      query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // This will match all records
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to clear activity logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Activity logs cleared successfully' });

  } catch (error) {
    console.error('Error in clear activity logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

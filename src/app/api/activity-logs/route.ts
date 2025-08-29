import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

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

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
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
      `)
      .eq('business_id', businessId);

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

    // Get logs with ordering
    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(100); // Limit to 100 most recent logs

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
    }) => ({
      id: log.id,
      timestamp: new Date(log.created_at),
      userName: log.user?.name || log.user?.username || 'Unknown User',
      userRole: log.user?.role || 'Unknown',
      action: log.activity_type,
      module: log.category,
      description: log.description,
      severity: log.metadata?.severity || 'medium',
      businessName: log.business?.name,
      storeName: log.store?.name,
      ipAddress: log.ip_address,
      metadata: log.metadata
    })) || [];

    return NextResponse.json({
      logs: transformedLogs,
      total: transformedLogs.length
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

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Build the delete query
    let query = supabase
      .from('activity_log')
      .delete()
      .eq('business_id', businessId);

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

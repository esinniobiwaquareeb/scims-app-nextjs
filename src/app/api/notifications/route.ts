import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET /api/notifications - Fetch notifications for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const businessId = searchParams.get('businessId');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!storeId || !businessId) {
      return NextResponse.json(
        { error: 'Store ID and Business ID are required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('notification')
      .select('*')
      .eq('store_id', storeId)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    console.error('Error in notifications GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, data, storeId, businessId } = body;

    if (!type || !title || !message || !storeId || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .from('notification')
      .insert({
        type,
        title,
        message,
        data: data || {},
        is_read: false,
        store_id: storeId,
        business_id: businessId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Update notification (mark as read, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, isRead, markAllAsRead, storeId, businessId } = body;

    if (markAllAsRead && storeId && businessId) {
      // Mark all notifications as read for the store
      const { error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('store_id', storeId)
        .eq('business_id', businessId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark all notifications as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (notificationId && typeof isRead === 'boolean') {
      // Mark specific notification as read/unread
      const { error } = await supabase
        .from('notification')
        .update({ is_read: isRead })
        .eq('id', notificationId);

      if (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
          { error: 'Failed to update notification' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in notifications PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';
    const storeId = searchParams.get('storeId');
    const businessId = searchParams.get('businessId');

    if (deleteAll && storeId && businessId) {
      // Delete all notifications for the store
      const { error } = await supabase
        .from('notification')
        .delete()
        .eq('store_id', storeId)
        .eq('business_id', businessId);

      if (error) {
        console.error('Error deleting all notifications:', error);
        return NextResponse.json(
          { error: 'Failed to delete all notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      // Delete specific notification
      const { error } = await supabase
        .from('notification')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
          { error: 'Failed to delete notification' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in notifications DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

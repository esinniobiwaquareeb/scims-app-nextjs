import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price_monthly,
      price_yearly,
      features,
      max_stores,
      max_products,
      max_users,
      is_active,
      display_order
    } = body;

    // Validate required fields
    if (!name || !description || price_monthly === undefined || price_yearly === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price_monthly, price_yearly' },
        { status: 400 }
      );
    }

    // Update subscription plan
    const { data: updatedPlan, error } = await supabase
      .from('subscription_plan')
      .update({
        name,
        description,
        price_monthly,
        price_yearly,
        features: features || [],
        max_stores: max_stores || 1,
        max_products: max_products || 100,
        max_users: max_users || 5,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: updatedPlan
    });

  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if plan exists and get its name
    const { data: existingPlan, error: fetchError } = await supabase
      .from('subscription_plan')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of trial plans
    if (existingPlan.name.toLowerCase() === 'trial') {
      return NextResponse.json(
        { error: 'Cannot delete the trial plan' },
        { status: 400 }
      );
    }

    // Delete subscription plan
    const { error } = await supabase
      .from('subscription_plan')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all active subscription plans
    const { data: subscriptionPlans, error } = await supabase
      .from('subscription_plan')
      .select(`
        id,
        name,
        price_monthly,
        price_yearly,
        description,
        features,
        max_stores,
        max_products,
        max_users,
        is_active,
        display_order,
        billing_cycle,
        is_popular,
        price,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedPlans = subscriptionPlans?.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price || `$${plan.price_monthly}/month`,
      status: plan.is_active ? 'active' : 'inactive',
      description: plan.description,
      features: plan.features || [],
      maxStores: plan.max_stores,
      maxProducts: plan.max_products,
      maxUsers: plan.max_users,
      monthlyPrice: plan.price_monthly,
      yearlyPrice: plan.price_yearly,
      billingCycle: plan.billing_cycle,
      isPopular: plan.is_popular,
      displayOrder: plan.display_order
    })) || [];

    return NextResponse.json({
      success: true,
      plans: transformedPlans
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

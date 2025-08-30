import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

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
      displayOrder: plan.display_order,
      // Add these fields for the SubscriptionManagement component
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_stores: plan.max_stores,
      max_products: plan.max_products,
      max_users: plan.max_users,
      is_active: plan.is_active,
      display_order: plan.display_order,
      created_at: plan.created_at,
      updated_at: plan.updated_at
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

export async function POST(request: NextRequest) {
  try {
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

    // Create new subscription plan
    const { data: newPlan, error } = await supabase
      .from('subscription_plan')
      .insert({
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
        billing_cycle: 'monthly',
        is_popular: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: newPlan
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch specific business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: business, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      business
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch business' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update business
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessData = await request.json();

    const { data: business, error } = await supabase
      .from('business')
      .update(businessData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      business
    });

  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update business' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete business and all related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Starting comprehensive deletion of business: ${id}`);
    
    // Step 1: Get all users associated with this business only
    const { data: businessUsers, error: usersError } = await supabase
      .from('user_business_role')
      .select('user_id')
      .eq('business_id', id);
    
    if (usersError) throw usersError;
    
    const userIdsToCheck = businessUsers?.map(ubr => ubr.user_id) || [];
    console.log(`Found ${userIdsToCheck.length} users associated with business ${id}`);
    
    // Step 2: Check if any of these users are associated with other businesses
    const { data: otherBusinessUsers, error: otherUsersError } = await supabase
      .from('user_business_role')
      .select('user_id, business_id')
      .in('user_id', userIdsToCheck)
      .neq('business_id', id);
    
    if (otherUsersError) throw otherUsersError;
    
    // Step 3: Identify users that are ONLY associated with this business
    const usersInOtherBusinesses = new Set(otherBusinessUsers?.map(ubu => ubu.user_id) || []);
    const usersToDelete = userIdsToCheck.filter(userId => !usersInOtherBusinesses.has(userId));
    
    console.log(`Users to be completely deleted: ${usersToDelete.length}`);
    console.log(`Users that will remain (associated with other businesses): ${usersInOtherBusinesses.size}`);
    
    // Step 4: Delete users that are only associated with this business
    if (usersToDelete.length > 0) {
      console.log('Deleting users that are only associated with this business...');
      
      // Delete from user_role table first (CASCADE will handle user_business_role)
      const { error: userRoleDeleteError } = await supabase
        .from('user_role')
        .delete()
        .in('user_id', usersToDelete);
      
      if (userRoleDeleteError) throw userRoleDeleteError;
      
      // Delete from user table
      const { error: userDeleteError } = await supabase
        .from('user')
        .delete()
        .in('id', usersToDelete);
      
      if (userDeleteError) throw userDeleteError;
      
      console.log(`Successfully deleted ${usersToDelete.length} users`);
    }
    
    // Step 5: Delete the business (CASCADE will handle all related tables)
    console.log('Deleting business and all related data via CASCADE...');
    
    const { error: businessDeleteError } = await supabase
      .from('business')
      .delete()
      .eq('id', id);

    if (businessDeleteError) throw businessDeleteError;
    
    console.log(`Successfully deleted business ${id} and all related data`);
    
    return NextResponse.json({ 
      success: true, 
      deletedUsers: usersToDelete.length,
      remainingUsers: usersInOtherBusinesses.size
    });

  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete business' 
      },
      { status: 500 }
    );
  }
}

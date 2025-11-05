import { NextRequest, NextResponse } from 'next/server';
import { upsertPlatformMapping, getBusinessPlatformMappings, deletePlatformMapping } from '@/utils/ai-agent/platformMapping';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Get all platform mappings for a business
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id is required' },
        { status: 400 }
      );
    }

    const mappings = await getBusinessPlatformMappings(businessId);

    return NextResponse.json({
      success: true,
      mappings,
    });

  } catch (error) {
    console.error('Error in GET /api/ai-agent/platform-mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update platform mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      platform,
      platform_account_id,
      platform_phone_number,
      platform_username,
      platform_app_id,
      platform_secret,
      metadata,
    } = body;

    if (!business_id || !platform || !platform_account_id) {
      return NextResponse.json(
        { success: false, error: 'business_id, platform, and platform_account_id are required' },
        { status: 400 }
      );
    }

    if (!['whatsapp', 'instagram', 'tiktok', 'facebook'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform. Must be whatsapp, instagram, tiktok, or facebook' },
        { status: 400 }
      );
    }

    const mapping = await upsertPlatformMapping(
      business_id,
      platform as 'whatsapp' | 'instagram' | 'tiktok' | 'facebook',
      platform_account_id,
      {
        platform_phone_number,
        platform_username,
        platform_app_id,
        platform_secret,
        metadata,
      }
    );

    if (!mapping) {
      return NextResponse.json(
        { success: false, error: 'Failed to create/update platform mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mapping,
    });

  } catch (error) {
    console.error('Error in POST /api/ai-agent/platform-mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete platform mapping
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get('mapping_id');

    if (!mappingId) {
      return NextResponse.json(
        { success: false, error: 'mapping_id is required' },
        { status: 400 }
      );
    }

    const success = await deletePlatformMapping(mappingId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete platform mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Platform mapping deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/ai-agent/platform-mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


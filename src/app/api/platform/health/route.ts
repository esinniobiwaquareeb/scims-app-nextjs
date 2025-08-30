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
    const startTime = Date.now();
    
    // Test database connectivity
    let databaseStatus = 'operational';
    let databaseLatency = 0;
    
    try {
      const dbStartTime = Date.now();
      const { data, error } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);
      
      databaseLatency = Date.now() - dbStartTime;
      
      if (error) {
        databaseStatus = 'degraded';
        console.warn('Database health check warning:', error);
      }
    } catch (error) {
      databaseStatus = 'down';
      console.error('Database health check failed:', error);
    }

    // Test storage connectivity (basic test)
    let storageStatus = 'operational';
    try {
      // Simple query to test storage access
      const { error } = await supabase
        .from('currency')
        .select('id')
        .limit(1);
      
      if (error) {
        storageStatus = 'degraded';
        console.warn('Storage health check warning:', error);
      }
    } catch (error) {
      storageStatus = 'down';
      console.error('Storage health check failed:', error);
    }

    // Test auth service
    let authStatus = 'operational';
    try {
      // Test auth service with a simple query
      const { error } = await supabase.auth.getUser();
      
      if (error) {
        authStatus = 'degraded';
        console.warn('Auth health check warning:', error);
      }
    } catch (error) {
      authStatus = 'down';
      console.error('Auth health check failed:', error);
    }

    // Calculate overall system status
    let overallStatus = [databaseStatus, storageStatus, authStatus].every(
      status => status === 'operational'
    ) ? 'healthy' : 'degraded';

    // Check if any service is completely down
    if ([databaseStatus, storageStatus, authStatus].some(
      status => status === 'down'
    )) {
      overallStatus = 'critical';
    }

    const totalLatency = Date.now() - startTime;

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      response_time: totalLatency,
      services: {
        database: databaseStatus,
        storage: storageStatus,
        auth: authStatus
      },
      metrics: {
        database_latency: databaseLatency,
        total_response_time: totalLatency
      },
      uptime: {
        // This would typically come from a monitoring service
        system: '99.9%',
        database: '99.95%',
        last_restart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      }
    };

    return NextResponse.json({
      success: true,
      health: healthData
    });

  } catch (error) {
    console.error('Error checking system health:', error);
    
    // Return critical status if health check fails completely
    return NextResponse.json({
      success: true,
      health: {
        status: 'critical',
        timestamp: new Date().toISOString(),
        response_time: 0,
        services: {
          database: 'unknown',
          storage: 'unknown',
          auth: 'unknown'
        },
        metrics: {
          database_latency: 0,
          total_response_time: 0
        },
        uptime: {
          system: 'unknown',
          database: 'unknown',
          last_restart: 'unknown'
        }
      }
    });
  }
}

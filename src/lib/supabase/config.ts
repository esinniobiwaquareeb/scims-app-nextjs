import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Ensure the URL has the proper protocol
const normalizedUrl = env.SUPABASE_URL.startsWith('http') 
  ? env.SUPABASE_URL 
  : `https://${env.SUPABASE_URL}`;

// Server-side Supabase client with service role key for API routes
// WARNING: This client bypasses RLS - only use for server-side operations
export const supabase = createClient(normalizedUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for user authentication (uses anon key, respects RLS)
// Use this for validating user tokens in middleware
export const supabaseAnon = createClient(normalizedUrl, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

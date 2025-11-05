import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Lazy initialization to avoid accessing env vars during build
let supabaseClient: SupabaseClient | null = null;
let supabaseAnonClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const supabaseUrl = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase environment variables. ' +
      'Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.'
    );
  }
  
  // Ensure the URL has the proper protocol
  const normalizedUrl = supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : `https://${supabaseUrl}`;
    
  supabaseClient = createClient(normalizedUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return supabaseClient;
}

function getSupabaseAnonClient(): SupabaseClient {
  if (supabaseAnonClient) {
    return supabaseAnonClient;
  }
  
  const supabaseUrl = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Missing required Supabase environment variables. ' +
      'Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.'
    );
  }
  
  // Ensure the URL has the proper protocol
  const normalizedUrl = supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : `https://${supabaseUrl}`;
    
  supabaseAnonClient = createClient(normalizedUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return supabaseAnonClient;
}

// Server-side Supabase client with service role key for API routes
// WARNING: This client bypasses RLS - only use for server-side operations
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((client as unknown) as Record<string, any>)[prop as string];
  }
}) as SupabaseClient;

// Client for user authentication (uses anon key, respects RLS)
// Use this for validating user tokens in middleware
export const supabaseAnon = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAnonClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((client as unknown) as Record<string, any>)[prop as string];
  }
}) as SupabaseClient;

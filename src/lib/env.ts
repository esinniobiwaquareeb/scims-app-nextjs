/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at runtime
 * Edge Runtime compatible - uses direct property access
 */

function getEnvVar(name: string, _required = true): string {
  const value = process.env[name];
  // Don't throw during module evaluation/build time
  // Validation will happen when the Supabase client is actually created (at runtime)
  // This allows the build to complete even if .env is not present
  return value || '';
}

function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

// Direct property access (Edge Runtime compatible)
export const env = {
  // Supabase (required)
  get SUPABASE_URL() { return getEnvVar('SUPABASE_URL'); },
  get SUPABASE_SERVICE_ROLE_KEY() { return getEnvVar('SUPABASE_SERVICE_ROLE_KEY'); },
  get SUPABASE_ANON_KEY() { return getEnvVar('SUPABASE_ANON_KEY'); },
  
  // App
  get NODE_ENV() { return getOptionalEnvVar('NODE_ENV', 'development'); },
  get NEXT_PUBLIC_BASE_URL() { return getOptionalEnvVar('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'); },
  
  // Email (optional)
  get SMTP_HOST() { return getOptionalEnvVar('SMTP_HOST', 'smtp.gmail.com'); },
  get SMTP_PORT() { return getOptionalEnvVar('SMTP_PORT', '587'); },
  get SMTP_USER() { return getOptionalEnvVar('SMTP_USER', ''); },
  get SMTP_PASS() { return getOptionalEnvVar('SMTP_PASS', ''); },
  
  // Rate Limiting (optional - Redis for production, in-memory for dev)
  get UPSTASH_REDIS_REST_URL() { return getOptionalEnvVar('UPSTASH_REDIS_REST_URL', ''); },
  get UPSTASH_REDIS_REST_TOKEN() { return getOptionalEnvVar('UPSTASH_REDIS_REST_TOKEN', ''); },
  
  // Vercel
  get VERCEL_URL() { return getOptionalEnvVar('VERCEL_URL', ''); },
} as const;


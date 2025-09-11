/**
 * Get the base URL for API calls
 * Works in both client-side and server-side environments
 */
export function getBaseUrl(): string {
  // Server-side
  if (typeof window === 'undefined') {
    // Check for Vercel deployment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Check for custom app URL
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    
    // Default to localhost for development
    return 'http://localhost:3000';
  }
  
  // Client-side
  return window.location.origin;
}

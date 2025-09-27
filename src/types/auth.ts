// Import base types from database
import { User, Business, Store } from './database';

// Re-export base types with auth-specific extensions
export type { User, Business, Store };

export interface DemoUser {
  username: string;
  role: string;
  description: string;
  isDemo: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface DemoUsersResponse {
  success: boolean;
  users: DemoUser[];
  error?: string;
}

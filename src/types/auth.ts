export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  role: string;
  businessId?: string;
  storeId?: string | undefined;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  business_type?: string;
  subscription_plan_id?: string;
  subscription_status: string;
  subscription_plans?: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  stores: Store[];
  createdAt: string;
  timezone?: string;
}

export interface Store {
  id: string;
  name: string;
  address?: string;
}

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

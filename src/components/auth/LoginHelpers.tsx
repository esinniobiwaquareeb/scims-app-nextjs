export const DEMO_CREDENTIALS = [
  { 
    role: 'Super Admin', 
    username: 'superadmin', 
    password: '123456',
    description: 'Complete system administration access'
  },
  { 
    role: 'Business Admin', 
    username: 'business_admin', 
    password: '123456',
    description: 'Business and store management'
  },
  { 
    role: 'Cashier', 
    username: 'cashier', 
    password: '123456',
    description: 'Point of sale operations only'
  }
];

export const validateLoginForm = (username: string, password: string): string | null => {
  if (!username?.trim()) {
    return 'Username is required';
  }
  
  if (!password) {
    return 'Password is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  return null;
};

export const formatDemoCredentials = () => {
  return DEMO_CREDENTIALS.map(cred => (
    `${cred.role}: ${cred.username} / ${cred.password} - ${cred.description}`
  ));
};

export const isDemoCredential = (username: string): boolean => {
  return DEMO_CREDENTIALS.some(cred => 
    cred.username.toLowerCase() === username.toLowerCase()
  );
};

export const getDemoCredential = (username: string) => {
  return DEMO_CREDENTIALS.find(cred => 
    cred.username.toLowerCase() === username.toLowerCase()
  );
};
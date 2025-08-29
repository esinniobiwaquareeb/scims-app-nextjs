# SCIMS Next.js Authentication Setup

This guide will help you set up the authentication system for the SCIMS Next.js application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Required Environment Variables

### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL (must include `https://` protocol)
  - Format: `https://your-project-id.supabase.co`
  - Example: `https://eutsywibykwwvpqsrgkz.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in Project Settings > API)

### Next.js Configuration
- `NEXTAUTH_SECRET`: A random string for NextAuth.js encryption
- `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for development)

## Database Setup

Ensure your Supabase database has the following tables:

1. **user** - User accounts
2. **user_business_role** - User business relationships
3. **business** - Business information
4. **store** - Store information
5. **activity_log** - User activity tracking

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`

3. Test environment variables by visiting `/api/debug/env`

4. Test Supabase connection by visiting `/api/test`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Navigate to `http://localhost:3000`

## Authentication Flow

1. **Login Page** (`/auth/login`): Users can log in with username/password or use demo accounts
2. **Dashboard** (`/dashboard`): Protected route that shows after successful authentication
3. **API Routes**: Server-side authentication handling via `/api/auth/*` endpoints

## Features

- ✅ Username/password authentication
- ✅ Demo account support for testing
- ✅ Protected routes with middleware
- ✅ Client-side authentication state management
- ✅ Automatic redirects based on auth status
- ✅ Activity logging for security

## Security Notes

- The service role key has full database access - keep it secure
- Passwords are hashed using bcrypt
- Authentication state is stored in localStorage (consider using httpOnly cookies for production)
- All API routes are protected server-side

## Troubleshooting

### Common Issues:

1. **"Invalid URL" Error**: Make sure your `SUPABASE_URL` includes `https://`
2. **"Missing Supabase environment variables"**: Check that `.env.local` exists and has the correct variables
3. **Database connection failed**: Verify your service role key is correct

### Debug Routes:

- `/api/debug/env` - Check environment variable status
- `/api/test` - Test Supabase connection

## Next Steps

After setting up authentication, you can:

1. Add more protected routes
2. Implement role-based access control
3. Add password reset functionality
4. Implement session management
5. Add two-factor authentication

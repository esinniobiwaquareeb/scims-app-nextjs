# SCIMS - Stock Control Inventory Management System

A comprehensive inventory management system built with Next.js 15, TypeScript, and Supabase.

## Features

- 🏪 **Multi-tenant Business Management** - Support for multiple businesses and stores
- 💰 **Point of Sale (POS)** - Complete POS system with barcode scanning
- 📦 **Inventory Management** - Stock tracking, restocking, and low stock alerts
- 👥 **User Management** - Role-based access control with permissions
- 📊 **Reporting & Analytics** - Sales reports, inventory reports, and dashboards
- 🔔 **Notifications** - Real-time notifications for important events
- 📱 **PWA Support** - Progressive Web App with offline capabilities
- 🎨 **Dark Mode** - Full dark mode support
- 🌐 **Multi-language** - Support for multiple languages and currencies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: React Context, Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis (with in-memory fallback)
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Application (Optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password

# Rate Limiting - Redis (Optional, for production)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scims-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
   - Run the SQL scripts in the `database/` directory in order:
     - `main.sql` - Main schema
     - `sample-data.sql` - Sample data (optional)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:run` - Run tests once

## Project Structure

```
scims-nextjs/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   └── [routes]/     # Application routes
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library configurations
│   ├── test/             # Test files
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── database/              # Database SQL scripts
├── public/                # Static assets
└── docs/                  # Documentation
```

## Security Features

- ✅ Rate limiting on all API routes
- ✅ Input validation with Zod
- ✅ Centralized error handling
- ✅ Security headers configured
- ✅ Environment variable validation
- ✅ Proper authentication middleware

See [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md) for detailed security documentation.

## Development

### API Routes

All API routes use the new wrapper pattern for consistent error handling and rate limiting:

```typescript
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';

const handler = createApiHandler(async ({ request }) => {
  // Your handler logic
  return successResponse({ data });
}, { rateLimit: 'API' });

export const GET = handler;
```

### Adding New Features

1. Create database migrations if needed
2. Add API routes in `src/app/api/`
3. Create components in `src/components/`
4. Add types in `src/types/`
5. Write tests in `src/test/`

## Database

The database schema includes:

- Users and authentication
- Businesses and stores
- Products and inventory
- Sales and transactions
- Customers and suppliers
- Roles and permissions
- Discounts and promotions
- Activity logs
- Notifications

See `database/main.sql` for the complete schema.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Your License Here]

## Support

For support, email support@example.com or create an issue in the repository.

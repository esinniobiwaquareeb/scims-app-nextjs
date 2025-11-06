# Affiliate System - QA Testing Guide

## Overview
SaaS affiliate system where affiliates refer businesses to sign up. Two commission types:
- **Signup Commission**: One-time when business signs up (percentage or fixed)
- **Subscription Commission**: Recurring on subscription payments (percentage only)

## User Roles
- **Affiliate**: Independent marketer who refers businesses
- **Superadmin**: Reviews applications, approves/rejects, manages affiliates

## Key Pages & Routes

### Affiliate Pages
- `/affiliate/apply` - Application form
- `/affiliate/login` - Affiliate login
- `/affiliate/dashboard` - Affiliate dashboard (stats, commissions, referrals)

### Superadmin Pages
- `/affiliates` - Affiliate management (list, approve, reject, delete)

## Test Scenarios

### 1. Affiliate Application Flow
1. Navigate to `/affiliate/apply`
2. Fill form:
   - Name, Email, Phone (required)
   - Preferred affiliate code (optional, must be unique)
   - Why affiliate, Social media (optional)
   - Payment method: Bank Transfer / PayPal / Other
   - Payment details (conditional based on method)
3. Submit → Should receive confirmation email
4. Check database: `affiliate` table, `application_status = 'pending'`

### 2. Superadmin Approval Flow
1. Login as superadmin → Navigate to `/affiliates`
2. Find pending affiliate → Click "Approve"
3. Set commissions:
   - Signup: Type (percentage/fixed), Rate/Amount
   - Subscription: Rate (percentage only)
4. Set password (optional - auto-generated if not provided)
5. Approve → Affiliate receives approval email with login credentials
6. Verify: `application_status = 'approved'`, `status = 'active'`, password_hash set

### 3. Superadmin Rejection Flow
1. Find pending affiliate → Click "Reject"
2. Enter rejection reason
3. Reject → Affiliate receives rejection email
4. Verify: `application_status = 'rejected'`

### 4. Affiliate Login
1. Navigate to `/affiliate/login`
2. Use email + password from approval email
3. Verify: Redirects to dashboard, stores affiliate data in localStorage

### 5. Business Signup with Affiliate Code
1. During business registration, include `affiliate_code` or `referral_id`
2. Complete signup
3. Verify:
   - `affiliate_referral` record created with `status = 'converted'`
   - `affiliate_commission` record created with `commission_type = 'signup'`
   - Commission calculated based on affiliate's signup commission settings

### 6. Subscription Commission
1. When referred business pays subscription:
   - `affiliate_commission` record created with `commission_type = 'subscription'`
   - Commission = subscription_amount × subscription_commission_rate

### 7. Affiliate Dashboard
- Stats cards: Total Referrals, Total Businesses, Total Commissions, Pending Commissions
- Commission history table (filterable by type: signup/subscription)
- Referrals table (business signups)
- Copy affiliate link functionality

### 8. Delete Affiliate
1. Superadmin → Find approved affiliate → Click "Delete"
2. Confirm in modal dialog
3. Verify: Affiliate + all related data deleted (referrals, commissions, payouts via CASCADE)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/affiliates/apply` | POST | Submit application |
| `/api/affiliates` | GET | List affiliates (superadmin) |
| `/api/affiliates/[id]` | GET | Get affiliate details |
| `/api/affiliates/[id]` | DELETE | Delete affiliate |
| `/api/affiliates/[id]/approve` | POST | Approve/reject application |
| `/api/affiliates/[id]/stats` | GET | Get affiliate statistics |
| `/api/affiliates/auth/login` | POST | Affiliate login |
| `/api/affiliates/track` | POST | Track referral (during signup) |
| `/api/affiliates/referrals` | GET | Get referrals |
| `/api/affiliates/commissions` | GET | Get commissions |
| `/api/affiliates/payouts` | GET | Get payouts |

## Database Tables

- `affiliate` - Affiliate records
- `affiliate_referral` - Business signup tracking
- `affiliate_commission` - Commission records (signup/subscription)
- `affiliate_payout` - Payout records

## Email Notifications

1. **Application Submitted**: Sent to applicant
2. **Application Approved**: Sent to affiliate with login credentials
3. **Application Rejected**: Sent to applicant with reason

## Key Validations

- Affiliate code must be unique
- Email must be unique
- Preferred code must be unique (if provided)
- Password min 8 characters (if manually set)
- Commission rates: 0-100% for percentage, >= 0 for fixed
- Referral expires after 90 days if not converted

## Edge Cases to Test

1. Duplicate affiliate code during application
2. Duplicate email during application
3. Approve without setting password (auto-generation)
4. Delete affiliate with existing referrals/commissions
5. Business signup with invalid affiliate code
6. Business signup without affiliate code
7. Multiple signups with same affiliate code
8. Commission calculation with 0% rate
9. Commission calculation with fixed amount
10. Filter commissions by type (signup vs subscription)


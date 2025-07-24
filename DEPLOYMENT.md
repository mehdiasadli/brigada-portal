# Vercel Deployment Guide for Brigada Portal

This guide covers deploying the Brigada Portal application to Vercel with all necessary configurations.

## Prerequisites

- [Vercel account](https://vercel.com)
- PostgreSQL database (Supabase, PlanetScale, Neon, etc.)
- Mailjet account for email services
- GitHub repository

## Database Setup

### Option 1: Supabase (Recommended)

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the `DATABASE_URL` (Connection string)
5. Set both `DATABASE_URL` and `DIRECT_URL` to the same connection string

### Option 2: PlanetScale

1. Go to [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Create a production branch
4. Get connection string from "Connect" button
5. Set both `DATABASE_URL` and `DIRECT_URL` to the connection string

### Option 3: Neon

1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Set both `DATABASE_URL` and `DIRECT_URL` to the connection string

## Vercel Deployment Steps

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `brigada-info`

### 2. Configure Environment Variables

In Vercel project settings, add these environment variables:

**Required Variables:**

```
DATABASE_URL=postgresql://username:password@your-db-host:5432/brigada_portal
DIRECT_URL=postgresql://username:password@your-db-host:5432/brigada_portal
NEXTAUTH_SECRET=your-super-secret-jwt-secret-key-here
NEXTAUTH_URL=https://your-project-name.vercel.app
```

**Email Configuration (Mailjet):**

```
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
MAILJET_FROM_EMAIL=noreply@brigada.gov.az
```

**How to add environment variables:**

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable with appropriate environment scope (Production, Preview, Development)

### 3. Deploy

1. Click "Deploy" button in Vercel
2. Wait for the build to complete
3. Vercel will automatically:
   - Install dependencies
   - Run `prisma generate`
   - Build the Next.js application
   - Deploy to production

## Database Migration

After successful deployment, you need to run database migrations:

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database migration
vercel env pull .env.local
npx prisma db push
```

### Option 2: Using Database Studio

1. Use your database provider's interface (Supabase Studio, PlanetScale console, etc.)
2. Run the SQL schema manually from `prisma/schema.prisma`

### Option 3: Using GitHub Actions (Advanced)

Set up a GitHub Action to run migrations automatically on deployment.

## Verification Steps

### 1. Check Application

- Visit your Vercel URL: `https://your-project-name.vercel.app`
- Verify the homepage loads correctly
- Test user registration and login

### 2. Check Database Connection

- Try registering a new user
- Check if the user is created in your database
- Verify email notifications work

### 3. Check Analytics

- Vercel Analytics is automatically enabled
- View analytics in Vercel dashboard after some traffic

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable

### 2. Email Domain (Optional)

1. If using custom domain, update `MAILJET_FROM_EMAIL`
2. Configure DNS records for email sending (SPF, DKIM)

### 3. Database Seeding (Optional)

Create an admin user for initial access:

```sql
-- Run this in your database console
INSERT INTO users (id, name, email, password, roles, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@brigada.gov.az',
  '$2a$12$your-hashed-password-here',
  '["ADMIN"]',
  NOW(),
  NOW()
);
```

Use bcrypt to hash your password:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

## Troubleshooting

### Build Failures

**Prisma Issues:**

- Ensure `DATABASE_URL` is set correctly
- Check if database is accessible from Vercel
- Verify Prisma schema syntax

**Environment Variables:**

- Double-check all required variables are set
- Ensure no typos in variable names
- Verify values don't contain special characters that need escaping

### Runtime Issues

**Database Connection:**

- Check database provider's connection limits
- Verify connection string format
- Ensure database is not behind a firewall

**Authentication Issues:**

- Verify `NEXTAUTH_SECRET` is set and secure
- Check `NEXTAUTH_URL` matches your domain
- Ensure it starts with `https://` in production

**Email Issues:**

- Verify Mailjet credentials
- Check email sending limits
- Test with different email providers

## Monitoring and Maintenance

### 1. Vercel Analytics

- Monitor page views and performance
- Track user interactions
- View Core Web Vitals

### 2. Database Monitoring

- Monitor connection usage
- Check query performance
- Set up alerts for issues

### 3. Email Monitoring

- Monitor email delivery rates
- Check bounce rates
- Track email engagement

## Security Considerations

1. **Environment Variables:**

   - Never commit secrets to version control
   - Use different secrets for different environments
   - Rotate secrets regularly

2. **Database:**

   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **Application:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Regular security audits

## Performance Optimization

1. **Database:**

   - Add database indexes for frequently queried fields
   - Use connection pooling
   - Monitor slow queries

2. **Application:**

   - Enable Vercel Edge Functions for global performance
   - Use Vercel Image Optimization
   - Implement caching strategies

3. **Monitoring:**
   - Set up Vercel Speed Insights
   - Monitor Core Web Vitals
   - Track performance metrics

## Support

- **Vercel Documentation:** [https://vercel.com/docs](https://vercel.com/docs)
- **Prisma Documentation:** [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Mailjet Documentation:** [https://dev.mailjet.com/](https://dev.mailjet.com/)

---

## Quick Reference

**Essential Commands:**

```bash
# Deploy to Vercel
vercel --prod

# Pull environment variables
vercel env pull .env.local

# Check deployment status
vercel ls

# View logs
vercel logs
```

**Environment Variables Checklist:**

- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `MAILJET_API_KEY`
- [ ] `MAILJET_SECRET_KEY`
- [ ] `MAILJET_FROM_EMAIL`

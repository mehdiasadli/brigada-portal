# Government Portal

A secure government documentation portal built with Next.js, Auth.js, and Prisma.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Database Setup

This project uses PostgreSQL with Prisma. You need to set up a PostgreSQL database first.

#### Option A: Local PostgreSQL Installation

1. Install PostgreSQL on your machine
2. Create a database named `brigada_info`
3. Note your database credentials

#### Option B: Docker PostgreSQL (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name postgres-brigada \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=brigada_info \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Environment Configuration

1. Copy the environment template:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your database credentials:

```bash
# Example for local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/brigada_info"

# Example for Docker setup above
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brigada_info"

# Generate a secret key
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Generate a secure secret:

```bash
openssl rand -base64 32
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

- **Authentication**: Secure login/registration with Auth.js
- **Authorization**: Role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Government-styled interface with Tailwind CSS
- **Content**: MDX support for documents and articles

## Development

- **Registration**: Available in development mode only
- **Default Role**: New users get USER role
- **Protected Routes**: All pages except login/register require authentication

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Ensure PostgreSQL is running
2. Verify your DATABASE_URL in `.env.local`
3. Check database credentials and permissions
4. Run `npx prisma db push` to sync schema

### Environment Variables

Make sure your `.env.local` file exists and contains:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

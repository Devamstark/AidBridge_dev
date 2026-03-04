# Environment Variables Required for Vercel Deployment

## Required Environment Variables

Configure these in your Vercel project settings:

### 1. DATABASE_URL (Required)
Your Neon PostgreSQL connection string.

**Format:**
```
DATABASE_URL="postgresql://username:password@host.neon.tech/database_name?sslmode=require"
```

**How to get it:**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (use the psql format)
5. Replace the password placeholder with your actual password

### 2. JWT_SECRET (Required)
A secret key for JWT token generation and verification.

**Generate a secure secret:**
```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Requirements:**
- Minimum 32 characters
- Use a mix of letters, numbers, and symbols
- Store it securely - never commit to git

### 3. NODE_ENV (Optional)
Vercel sets this automatically based on the environment:
- `production` for production deployments
- `preview` for preview deployments
- `development` for local development

## How to Set Environment Variables in Vercel

### Via Vercel Dashboard:
1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add Environment Variable**
4. Add each variable:
   - `DATABASE_URL` - Your Neon connection string
   - `JWT_SECRET` - Your JWT secret key
5. Set the environment (Production, Preview, Development)
6. Click **Save**

### Via Vercel CLI:
```bash
# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# Deploy with environment variables
vercel --prod
```

## Verifying Environment Variables

After deploying, you can verify the environment variables are set:

1. Check Vercel Function Logs:
   - Go to your deployment in Vercel
   - Click on **Functions** tab
   - Select any API function
   - Check the logs for any errors related to missing env vars

2. Test API endpoint:
   ```bash
   # Test with curl (replace with your actual URL and token)
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://your-domain.vercel.app/api/disasters
   ```

## Troubleshooting 500 Errors

If you're still getting 500 errors after setting environment variables:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Click on **Functions** tab
   - Select the failing function (e.g., `api/disasters.ts`)
   - Review the error logs

2. **Common Issues:**
   - `DATABASE_URL` is incorrect or missing
   - `JWT_SECRET` is missing or too short
   - Database migrations haven't been run
   - SSL mode not set in connection string

3. **Database Migration:**
   Make sure your database schema is up to date:
   ```bash
   # Run migrations
   npx prisma migrate deploy
   ```

## Local Development

For local development, create a `.env.local` file:

```bash
# .env.local (DO NOT COMMIT TO GIT)
DATABASE_URL="postgresql://username:password@host.neon.tech/database_name?sslmode=require"
JWT_SECRET="your-local-jwt-secret-min-32-chars"
```

Then run:
```bash
npm run dev
```

## Security Notes

- ⚠️ **Never commit `.env.local` or any file containing secrets to git**
- ✅ Use different secrets for development and production
- ✅ Rotate your JWT_SECRET periodically
- ✅ Use connection pooling in production (Neon handles this automatically)
- ✅ Enable SSL for database connections (`sslmode=require`)

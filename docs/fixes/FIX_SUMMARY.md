# 🔧 Complete Fix Guide - API 500 Errors

## ✅ What Was Fixed

### 1. Prisma Version Downgrade
- **Problem**: Prisma 7.x has breaking changes incompatible with Vercel serverless
- **Solution**: Downgraded to Prisma 6.x (stable)
- **Files**: `package.json`

### 2. TypeScript Configuration
- **Problem**: Missing TypeScript config for API functions
- **Solution**: Added `tsconfig.json` and `api/tsconfig.json`
- **Files**: `tsconfig.json`, `api/tsconfig.json`

### 3. Vercel Configuration
- **Problem**: Missing functions runtime specification
- **Solution**: Added `@vercel/node` runtime to `vercel.json`
- **Files**: `vercel.json`

### 4. Database Schema Relations
- **Problem**: Missing reverse relation in Disaster model
- **Solution**: Added `publicHelpRequests` relation
- **Files**: `prisma/schema.prisma`

### 5. Database Migrations
- **Problem**: Database tables don't exist
- **Solution**: Need to run migrations (you must do this)

---

## ⚠️ What YOU Need to Do Now

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the project root with:

```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/aidbridge?sslmode=require"
JWT_SECRET="generate-a-secure-32-character-secret-key"
```

**How to get DATABASE_URL:**
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. Replace the password placeholder

**How to generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### Step 2: Run Database Migrations

Open a terminal in the project folder and run:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init
```

This will:
- Create the `prisma/migrations` folder
- Create all database tables in your Neon database
- Seed the database structure

### Step 3: (Optional) Seed Sample Data

If you have a seed file:

```bash
npx tsx prisma/seed.ts
```

### Step 4: Test Locally

```bash
npm run dev
```

Open http://localhost:5173 and test:
- Login
- Navigate to different pages
- Submit a help request

### Step 5: Deploy to Vercel

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix API 500 errors - Prisma 6 downgrade and migrations"
   git push origin main
   ```

2. **Vercel will auto-deploy**

3. **Set Environment Variables in Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add:
     - `DATABASE_URL` (your Neon connection string)
     - `JWT_SECRET` (32+ character secret)

4. **Redeploy**

---

## 🗃️ Database Migration Commands

### Local Development
```bash
# Create migration
npx prisma migrate dev --name <name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database
npx prisma studio
```

### Production (Vercel)
```bash
# Deploy migrations (no dev features)
npx prisma migrate deploy
```

---

## 🧪 Testing Checklist

After deployment, test these endpoints:

1. **Public Help Request** (no login required)
   - Go to `/help/request`
   - Fill form and submit
   - Should get Request ID

2. **Dashboard** (login required)
   - Login as admin
   - Check if data loads
   - No 500 errors

3. **Survivors Page**
   - Navigate to `/Survivors`
   - Should load without errors

4. **Resources Page**
   - Navigate to `/Resources`
   - Should load without errors

5. **Create Operations**
   - Try creating a disaster
   - Try creating a volunteer
   - Try creating a survivor

---

## 🐛 Troubleshooting

### Still Getting 500 Errors?

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Project → Functions
   - Select the failing function (e.g., `api/public/help.ts`)
   - Read the error message

2. **Common Issues:**

   **Error: "Table doesn't exist"**
   - You haven't run migrations yet
   - Run: `npx prisma migrate dev --name init`

   **Error: "DATABASE_URL is not set"**
   - Environment variable not configured
   - Set it in Vercel: Settings → Environment Variables

   **Error: "Unauthorized"**
   - JWT_SECRET not set
   - Set it in Vercel: Settings → Environment Variables

   **Error: "connect ECONNREFUSED"**
   - Database connection issue
   - Check DATABASE_URL format
   - Make sure `?sslmode=require` is included

3. **Verify Environment Variables:**

   In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Ensure both `DATABASE_URL` and `JWT_SECRET` exist
   - Ensure they're set for "Production" environment
   - Click Save if you made changes
   - Redeploy the project

---

## 📋 File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Downgraded Prisma to 6.x |
| `tsconfig.json` | Created - TypeScript config |
| `api/tsconfig.json` | Created - API TypeScript config |
| `vercel.json` | Added functions runtime config |
| `prisma/schema.prisma` | Fixed Disaster model relations |
| `api/_lib/db.ts` | Reverted to simple PrismaClient |
| `.env.template` | Created - Environment template |
| `DATABASE_MIGRATION.md` | Created - Migration guide |
| `API_FIX.md` | Created - API troubleshooting |
| `ENV_VARIABLES.md` | Created - Env var guide |

---

## 🎯 Expected Result

After completing all steps:

✅ No more 500 errors on API endpoints
✅ Help request form submits successfully
✅ Dashboard loads with data
✅ All CRUD operations work
✅ Database tables exist and are populated

---

## 📞 Quick Reference

### Neon Console
https://console.neon.tech

### Vercel Dashboard
https://vercel.com/dashboard

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Test API Endpoint
```bash
curl https://your-app.vercel.app/api/disasters
```

---

## ⏭️ Next Steps

1. ✅ Create `.env.local` with your DATABASE_URL
2. ✅ Run `npx prisma migrate dev --name init`
3. ✅ Test locally with `npm run dev`
4. ✅ Commit and push to GitHub
5. ✅ Set environment variables in Vercel
6. ✅ Redeploy
7. ✅ Test production deployment

**Good luck!** 🚀

# 🗄️ Database Migration Guide - AidBridge

## Problem
Your Vercel API is returning **500 errors** because the database tables don't exist yet. You need to run migrations to create the tables.

## Solution: Deploy Database Schema

### Option 1: Run Migrations Locally (Recommended)

#### Step 1: Set Up Environment Variable

Create a `.env.local` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/aidbridge?sslmode=require"
```

Replace with your actual Neon connection string.

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

#### Step 4: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
1. Create the `migrations` folder
2. Generate SQL for all tables
3. Apply migrations to your Neon database

#### Step 5: Seed Database (Optional)

If you have seed data:

```bash
npm run db:seed
```

#### Step 6: Deploy to Production

For production deployment on Vercel:

```bash
npx prisma migrate deploy
```

---

### Option 2: Use Prisma Studio (Visual)

1. Run Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. This opens a web UI at http://localhost:5555

3. You can manually create tables and data

---

### Option 3: Manual SQL (Advanced)

If migrations fail, you can run SQL directly in Neon Console:

1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Run the migration SQL

---

## Verify Migration Success

After running migrations, test the API:

1. **Deploy to Vercel** (push to GitHub)
2. **Open your app**
3. **Try submitting a help request**
4. **Should work now!** ✅

---

## Troubleshooting

### Error: "Table doesn't exist"
- Run migrations (see Step 4 above)

### Error: "Connection refused"
- Check your DATABASE_URL
- Make sure `?sslmode=require` is included
- Verify Neon project is active

### Error: "Prisma Client not generated"
- Run: `npx prisma generate`

### Error: "env var not set"
- Make sure `.env.local` exists with DATABASE_URL
- Or set environment variable in your shell

---

## Quick Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## After Migration

Once migrations are complete:

1. **Commit the migrations folder to git**:
   ```bash
   git add prisma/migrations
   git commit -m "Add database migrations"
   git push
   ```

2. **Vercel will automatically deploy** with the new schema

3. **Test all API endpoints**:
   - `/api/disasters`
   - `/api/volunteers`
   - `/api/survivors`
   - `/api/public/help`

---

## ⚠️ Important Notes

1. **Never skip migrations** - API functions expect tables to exist
2. **Always backup before production migrations**
3. **Test migrations locally first**
4. **Keep migration files in git** - they're your schema history

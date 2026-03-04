# 🔧 API 500 Error Fix - Deployment Guide

## Problem Summary

Your Vercel deployment is showing **500 Internal Server Error** for all API endpoints:
- `/api/volunteers`
- `/api/disasters`
- `/api/locations`
- `/api/survivors`
- `/api/distributions`
- `/api/resources`

## Root Cause

The API functions are failing because:
1. ✅ **Missing TypeScript configuration** - Fixed with `tsconfig.json` files
2. ✅ **Missing Vercel functions configuration** - Fixed in `vercel.json`
3. ⚠️ **Environment variables not set in Vercel** - You need to do this

---

## ✅ What I Fixed

### 1. Created TypeScript Configuration
- `tsconfig.json` - Root project configuration
- `api/tsconfig.json` - API functions configuration

### 2. Updated Vercel Configuration
- Added `functions` section to `vercel.json` specifying Node.js runtime
- Ensures TypeScript files are properly compiled

### 3. Created Environment Template
- `.env.example` - Template with all required variables

### 4. Created Documentation
- `ENV_VARIABLES.md` - Complete guide for environment variables

---

## ⚠️ What You Need to Do

### Step 1: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `aid-bridge-dev` project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Click **Add Environment Variable**

3. **Add DATABASE_URL**
   ```
   Name: DATABASE_URL
   Value: postgresql://user:password@host.neon.tech/aidbridge?sslmode=require
   Environment: Production (check the box)
   ```
   
   **How to get it:**
   - Go to https://console.neon.tech
   - Select your project
   - Click "Connection Details"
   - Copy the connection string
   - Replace password placeholder

4. **Add JWT_SECRET**
   ```
   Name: JWT_SECRET
   Value: <generate-new-secret>
   Environment: Production (check the box)
   ```
   
   **Generate secret:**
   ```bash
   # Run this command:
   openssl rand -base64 32
   # Copy the output
   ```

5. **Save and Deploy**
   - Click **Save**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment (or push a new commit)

### Step 2: Verify the Fix

1. **Wait for deployment to complete** (2-3 minutes)

2. **Check Function Logs**
   - Go to Vercel Dashboard → Your Project
   - Click **Functions** tab
   - Select `api/disasters.ts`
   - Check for any errors

3. **Test API Endpoints**
   - Open your app: https://aid-bridge-dev-git-main-devxs-projects-428208b6.vercel.app
   - Login with admin account
   - Navigate to Dashboard
   - Check if data loads without 500 errors

---

## 🔍 Troubleshooting

### Still Getting 500 Errors?

1. **Check Function Logs**
   ```
   Vercel Dashboard → Project → Functions → Select function → Logs
   ```
   
   Look for error messages like:
   - `Error: Unauthorized` → JWT_SECRET not set correctly
   - `Error: connect to database` → DATABASE_URL is wrong
   - `PrismaClientInitializationError` → Database connection issue

2. **Verify Database Connection**
   - Make sure your Neon database is active
   - Check the connection string format
   - Ensure `sslmode=require` is included

3. **Check Database Migrations**
   If migrations haven't run:
   ```bash
   # Locally with your DATABASE_URL
   export DATABASE_URL="your-connection-string"
   npx prisma migrate deploy
   ```

### Manifest 401 Error

The `manifest.json` 401 error is separate - it's trying to fetch from the wrong URL. This is a minor issue with the PWA manifest link in `index.html`. The app will work fine without it.

---

## 📋 Quick Checklist

- [ ] Copy DATABASE_URL from Neon
- [ ] Generate JWT_SECRET with openssl
- [ ] Add both variables to Vercel (Settings → Environment Variables)
- [ ] Set environment to "Production"
- [ ] Save changes
- [ ] Redeploy the project
- [ ] Wait for deployment to complete
- [ ] Test the app - API should work now!

---

## 🎯 Expected Result

After completing these steps:
- ✅ No more 500 errors on API endpoints
- ✅ Dashboard loads with data
- ✅ Survivors page works
- ✅ Resources page works
- ✅ All CRUD operations function properly

---

## 📞 Need Help?

If you're still having issues:
1. Check the Vercel Function Logs for specific error messages
2. Verify your DATABASE_URL works by testing locally
3. Make sure JWT_SECRET is at least 32 characters

**Common mistakes:**
- ❌ DATABASE_URL missing `?sslmode=require`
- ❌ JWT_SECRET too short (needs 32+ chars)
- ❌ Environment variables set for wrong environment (Preview vs Production)
- ❌ Forgot to redeploy after adding environment variables

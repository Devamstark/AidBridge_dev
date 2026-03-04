# 🚀 Vercel Deployment Guide - Complete

## Prerequisites

Before deploying, you need:
1. **Vercel Account** - Free at https://vercel.com
2. **Neon Database** - Free PostgreSQL at https://neon.tech
3. **GitHub Account** - For version control

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Database (Neon)

#### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub
3. Click "New Project"
4. Name: `aidbridge`
5. Region: Choose closest to you (e.g., us-east-1)
6. Click "Create"

#### 1.2 Get Connection String
1. In Neon dashboard, click your project
2. Click "Connection Details"
3. Copy the connection string (looks like):
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
4. **Save this securely** - You'll need it for Vercel

#### 1.3 Run Database Migrations Locally
```bash
# Set temporary env variable
export DATABASE_URL="your-neon-connection-string"

# Or create .env.local temporarily
echo "DATABASE_URL=your-neon-connection-string" >> .env.local

# Run migrations
npx prisma migrate dev --name init
npx prisma generate

# Remove temporary .env.local after migration
# (We'll set it properly in Vercel)
```

---

### Step 2: Prepare Your Code

#### 2.1 Remove Mock Data
Edit `src/api/client.ts`:

```typescript
// Change this line:
const USE_MOCK_DATA = true

// To:
const USE_MOCK_DATA = false
```

#### 2.2 Update .env.example
Make sure `.env.example` has all required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.vercel.app"

# Stripe (Optional - if using payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
VITE_APP_URL="https://your-app.vercel.app"
VITE_API_URL="/api"
```

#### 2.3 Generate Secrets
```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

### Step 3: Push to GitHub

#### 3.1 Initialize Git (if not already)
```bash
cd c:\Users\Admin\Desktop\aidbridge
git init
git add .
git commit -m "Initial commit - AidBridge ready for deployment"
```

#### 3.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `aidbridge`
3. Private (recommended)
4. Click "Create repository"

#### 3.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/aidbridge.git
git branch -M main
git push -u origin main
```

---

### Step 4: Deploy to Vercel

#### 4.1 Connect to Vercel
**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select `aidbridge` repository
5. Click "Import"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd c:\Users\Admin\Desktop\aidbridge
vercel --prod
```

#### 4.2 Configure Build Settings
In Vercel dashboard (during import):

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

#### 4.3 Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

Add these (Production):

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

JWT_SECRET=your-generated-jwt-secret-here

NEXTAUTH_SECRET=your-generated-nextauth-secret-here

NEXTAUTH_URL=https://your-app-name.vercel.app

VITE_APP_URL=https://your-app-name.vercel.app

VITE_API_URL=/api
```

**Important:** 
- Use your actual Neon connection string
- Use your actual generated secrets
- Replace `your-app-name` with your Vercel app name

#### 4.4 Deploy
1. Click "Deploy"
2. Wait 2-5 minutes for build
3. ✅ **Your app is live!**

---

### Step 5: Post-Deployment

#### 5.1 Test Your Live App
1. Visit: `https://your-app-name.vercel.app`
2. Test login
3. Test creating disaster
4. Test creating volunteer
5. Test all forms

#### 5.2 Check Logs
In Vercel dashboard:
- Go to "Deployments"
- Click your deployment
- Click "Function Logs"
- Check for errors

#### 5.3 Set Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your domain: `aidbridge.org` (example)
3. Update DNS records as instructed
4. Wait for DNS propagation (5-30 min)

---

## 🔧 Troubleshooting

### Issue: Build Fails
**Error:** `Prisma schema not found`

**Solution:**
```bash
# Make sure prisma folder exists
ls prisma/schema.prisma

# If missing, restore it
git checkout prisma/schema.prisma

# Regenerate client
npx prisma generate
```

---

### Issue: Database Connection Error
**Error:** `Can't reach database server`

**Solution:**
1. Check DATABASE_URL in Vercel env vars
2. Make sure Neon project is active
3. Check firewall settings in Neon dashboard
4. Ensure `?sslmode=require` is in connection string

---

### Issue: API Routes Not Working
**Error:** `404 Not Found` on /api/*

**Solution:**
Vercel needs API routes configured. Create `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.0.0"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

---

### Issue: Frontend Can't Connect to API
**Error:** Network errors in browser console

**Solution:**
Make sure `VITE_API_URL=/api` is set in Vercel env vars.

The frontend will proxy `/api` requests to Vercel serverless functions.

---

## 📊 Deployment Checklist

### Before Deploy
- [ ] Database created on Neon
- [ ] Connection string saved
- [ ] Secrets generated (JWT, NEXTAUTH)
- [ ] Mock data disabled (`USE_MOCK_DATA = false`)
- [ ] Code pushed to GitHub
- [ ] `.env` files not committed (check .gitignore)

### During Deploy
- [ ] Vercel project created
- [ ] GitHub repo connected
- [ ] All env vars added
- [ ] Build settings correct (Vite)
- [ ] Deploy started

### After Deploy
- [ ] App loads without errors
- [ ] Login works
- [ ] Can create disaster
- [ ] Can create volunteer
- [ ] Can create survivor
- [ ] All forms work
- [ ] No console errors
- [ ] Database has data

---

## 🎯 Quick Deploy Commands

```bash
# 1. Disable mock data
# Edit src/api/client.ts: const USE_MOCK_DATA = false

# 2. Set up env (create .env.local for testing)
cat > .env.local << EOF
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
EOF

# 3. Test migrations
npx prisma migrate dev
npx prisma generate

# 4. Build locally
npm run build

# 5. Deploy to Vercel
vercel --prod

# 6. Add env vars in Vercel dashboard
# 7. Test live app
```

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel env vars (not .env in repo)
- ✅ Rotate secrets regularly
- ✅ Use strong passwords (32+ chars)

### Database
- ✅ Use connection pooling (Neon does this)
- ✅ Enable SSL (sslmode=require)
- ✅ Restrict IP access in Neon
- ✅ Regular backups (Neon does this)

### API
- ✅ Rate limiting (add later)
- ✅ Input validation (Zod schemas)
- ✅ Authentication (JWT)
- ✅ CORS configured

---

## 📈 Monitoring

### Vercel Analytics
1. Go to Vercel dashboard → Analytics
2. Enable for your project
3. View traffic, performance

### Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/react
```

### Database Monitoring
- Neon dashboard shows query stats
- Check slow queries
- Monitor connection count

---

## 💰 Cost Estimate

### Free Tier (What You Get)
- **Vercel:** 
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions (100GB-hours)
  
- **Neon:**
  - 0.5 GB storage
  - 10 compute hours/day
  - Unlimited databases

**Total: $0/month** (perfect for testing!)

### When You Need Paid
- More than 100GB bandwidth
- More compute time
- Priority support
- Custom domains (still free on Vercel!)

---

## 🎉 You're Deployed!

Your AidBridge app is now:
- ✅ Live on Vercel
- ✅ Connected to Neon database
- ✅ Using real authentication
- ✅ Ready for production use

**Next Steps:**
1. Share URL with team
2. Create admin accounts
3. Train staff
4. Monitor usage
5. Add more features!

---

**Questions?** Check Vercel docs: https://vercel.com/docs  
**Neon help:** https://neon.tech/docs

---

*Guide Created: March 3, 2026*

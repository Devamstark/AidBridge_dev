# 🚀 Quick Deploy Checklist

## ✅ Pre-Deployment (Do This First)

### 1. Create Neon Database
- [ ] Go to https://neon.tech
- [ ] Sign up with GitHub
- [ ] Create new project: `aidbridge`
- [ ] Copy connection string
- [ ] Save it securely

### 2. Generate Secrets
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32
# Output: ________________________________

# NEXTAUTH Secret
openssl rand -base64 32
# Output: ________________________________
```

### 3. Update Code
- [ ] Mock data disabled (`USE_MOCK_DATA = false` in src/api/client.ts)
- [ ] `.env.example` has all variables
- [ ] `.gitignore` includes `.env.local`

### 4. Test Locally (Optional but Recommended)
```bash
# Create .env.local
cp .env.example .env.local

# Edit .env.local with your Neon connection string
# Edit .env.local with your generated secrets

# Run migrations
npx prisma migrate dev --name init
npx prisma generate

# Test app
npm run dev
```

---

## 📦 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/aidbridge.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select `aidbridge`

### Step 3: Configure Build
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables → Add:

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=your-jwt-secret-from-step-2
NEXTAUTH_SECRET=your-nextauth-secret-from-step-2
NEXTAUTH_URL=https://your-app.vercel.app
VITE_APP_URL=https://your-app.vercel.app
VITE_API_URL=/api
```

### Step 5: Deploy
- Click "Deploy"
- Wait 3-5 minutes
- ✅ App is live!

---

## ✅ Post-Deployment Tests

### Test 1: App Loads
- [ ] Visit: `https://your-app.vercel.app`
- [ ] Should see login page or dashboard

### Test 2: Login Works
- [ ] Click "Admin" button
- [ ] Should redirect to Dashboard
- [ ] Should see all menu items

### Test 3: Create Data
- [ ] Create a disaster
- [ ] Create a volunteer
- [ ] Create a survivor
- [ ] All should appear in lists

### Test 4: Check Database
- [ ] Go to Neon dashboard
- [ ] Check tables exist
- [ ] Check data is there

### Test 5: Check Logs
- [ ] Vercel dashboard → Deployments
- [ ] Click deployment
- [ ] Function Logs → No errors

---

## 🐛 Common Issues

### Issue: Build Failed
**Fix:** Check build logs in Vercel, usually missing env vars

### Issue: Can't Connect to Database
**Fix:** 
- Check DATABASE_URL is correct
- Ensure `?sslmode=require` is included
- Check Neon project is active

### Issue: API Routes 404
**Fix:** Make sure `vercel.json` exists with routes config

### Issue: Forms Don't Work
**Fix:** 
- Check VITE_API_URL=/api is set
- Check browser console for errors
- Check Vercel function logs

---

## 📋 Quick Reference

### Commands
```bash
# Local testing
npx prisma migrate dev
npx prisma generate
npm run dev

# Deploy
vercel --prod

# View logs
vercel logs
```

### Important Files
- `prisma/schema.prisma` - Database schema
- `src/api/client.ts` - API client (mock data toggle)
- `.env.example` - Environment template
- `vercel.json` - Vercel config

### Important URLs
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech
- Vercel Docs: https://vercel.com/docs

---

## 💡 Pro Tips

1. **Use Vercel CLI** for faster deploys:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Preview Deployments** for pull requests:
   - Every PR gets a preview URL
   - Test before merging to main

3. **Environment Variables:**
   - Can be different for Preview/Production
   - Update in Vercel dashboard

4. **Custom Domain:**
   - Free on Vercel
   - Settings → Domains → Add your domain

5. **Monitoring:**
   - Enable Vercel Analytics (free)
   - Check function logs regularly

---

## 🎉 You're Done!

Your AidBridge app is now:
- ✅ Live on Vercel
- ✅ Connected to Neon database
- ✅ Ready for production
- ✅ Scalable and secure

**Share your URL:** `https://your-app.vercel.app`

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- Neon Docs: https://neon.tech/docs
- Check `VERCEL_DEPLOYMENT_GUIDE.md` for detailed guide

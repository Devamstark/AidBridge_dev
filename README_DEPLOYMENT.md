# 🚀 AidBridge - Deployment Ready

**Status:** ✅ Ready for Vercel Deployment  
**Mock Data:** ❌ Disabled (using real API)  
**Database:** Neon PostgreSQL Ready

---

## ⚡ Quick Deploy (5 Minutes)

### 1️⃣ Set Up Database (2 min)
```
1. Go to https://neon.tech
2. Sign up with GitHub
3. New Project → Name: "aidbridge"
4. Copy connection string
5. Save it (you'll need it in Step 3)
```

### 2️⃣ Generate Secrets (1 min)
```bash
# Run these commands:
openssl rand -base64 32
# Copy output → JWT_SECRET

openssl rand -base64 32
# Copy output → NEXTAUTH_SECRET
```

### 3️⃣ Deploy to Vercel (2 min)
```
1. Go to https://vercel.com/new
2. Import this GitHub repository
3. Framework Preset: Vite (auto-detected)
4. Add Environment Variables (see below)
5. Click Deploy
```

### 4️⃣ Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=<from-step-2>
NEXTAUTH_SECRET=<from-step-2>
NEXTAUTH_URL=https://your-app.vercel.app
VITE_APP_URL=https://your-app.vercel.app
VITE_API_URL=/api
```

### 5️⃣ Test Your App
```
1. Visit: https://your-app.vercel.app
2. Login as Admin
3. Create a test disaster
4. Create a test volunteer
5. ✅ Everything works!
```

---

## 📁 What's Included

### ✅ Deployment Files
- `vercel.json` - Vercel configuration
- `.env.example` - Environment template
- `prisma/schema.prisma` - Database schema
- `api/` - Serverless API routes

### ✅ Features Ready
- ✅ User Authentication (JWT)
- ✅ Role-Based Access (Admin/Coordinator/Volunteer)
- ✅ Public Victim Portal
- ✅ Disaster Management
- ✅ Volunteer Management
- ✅ Survivor Management
- ✅ Location Management
- ✅ Resource Management
- ✅ Distribution Tracking
- ✅ Emergency Dispatch
- ✅ Break-Glass Access
- ✅ Multi-language Support
- ✅ Dark/Light Mode
- ✅ Mobile Responsive

---

## 🛠️ Local Development (Optional)

### Setup Local Environment
```bash
# 1. Clone repository
git clone <your-repo-url>
cd aidbridge

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local

# 4. Edit .env.local with your values
# - DATABASE_URL (from Neon)
# - JWT_SECRET (generated)
# - NEXTAUTH_SECRET (generated)

# 5. Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# 6. Start development server
npm run dev
```

### Available Commands
```bash
npm run dev          # Development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (database GUI)
```

---

## 📊 Database Schema

### Tables (13 Total)
1. **User** - Staff accounts & authentication
2. **Session** - User sessions
3. **Account** - OAuth accounts
4. **Volunteer** - Volunteer profiles
5. **VolunteerLocationHistory** - Location tracking
6. **Disaster** - Disaster events
7. **Survivor** - Registered survivors
8. **Location** - Shelters & facilities
9. **Resource** - Resource catalog
10. **Distribution** - Resource distributions
11. **DistributionItem** - Distribution line items
12. **EmergencyRequest** - Emergency dispatch requests
13. **Mission** - Volunteer missions
14. **Inventory** - Disaster inventory
15. **AuditLog** - System audit trail
16. **BreakGlassEvent** - Emergency access events
17. **PublicHelpRequest** - Public help requests (NEW!)
18. **SurvivorRegistration** - Public registrations (NEW!)

---

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Role-based access control
- Session management

### Data Protection
- Input validation (Zod schemas)
- SQL injection prevention (Prisma ORM)
- XSS protection (React escapes by default)
- CORS configured

### Access Control
- Admin: Full access
- Coordinator: Operational access
- Volunteer: Limited field access
- Public: No authentication required for help requests

---

## 🌐 Public Portal

### Features (No Login Required)
- **Emergency Help Request** - Request immediate assistance
- **Survivor Registration** - Self-register for assistance
- **Request Tracking** - Track request status with ID

### URLs
- `/help` - Public landing page
- `/help/request` - Emergency help form
- `/register` - Survivor registration
- `/track` - Track request status

---

## 📱 Mobile Support

### Responsive Design
- ✅ Mobile-first approach
- ✅ Bottom navigation for mobile
- ✅ Touch-friendly interface
- ✅ Pull-to-refresh
- ✅ Offline support ready

### Tested On
- iOS Safari
- Android Chrome
- Tablet devices
- Desktop browsers

---

## 🎨 Customization

### Brand Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: 'hsl(355, 69%, 50%)', // AidBridge Red #D72836
  secondary: 'hsl(213, 44%, 33%)', // AidBridge Blue #2F4F79
}
```

### Logo
Replace in `src/Layout.jsx`:
```jsx
<img src="your-logo-url.svg" alt="AidBridge" />
```

### Languages
Add translations in `src/components/i18n/translations.jsx`

---

## 📈 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Track page views
- Monitor performance

### Database Monitoring
- Neon dashboard shows query stats
- Check slow queries
- Monitor connections

### Error Tracking
Check Vercel Function Logs:
- Vercel Dashboard → Deployments → Function Logs
- Look for errors
- Fix and redeploy

---

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
# Make changes
git add .
git commit -m "Update description"
git push

# Vercel auto-deploys on push to main
# Or manually:
vercel --prod
```

### Database Migrations
```bash
# After schema changes
npx prisma migrate dev --name migration_name
git push

# Vercel will run migrations on deploy
# Or manually:
npx prisma migrate deploy
```

### Backup Database
Neon automatically backs up:
- Daily backups
- Point-in-time recovery
- Branch for testing

---

## 💰 Costs

### Free Tier (Starting)
- **Vercel:** Free up to 100GB bandwidth
- **Neon:** Free 0.5GB storage
- **Total:** $0/month

### When You Grow
- **Vercel Pro:** $20/month (more bandwidth)
- **Neon Pro:** $19/month (more storage)
- **Total:** ~$40/month

---

## 🆘 Support

### Documentation
- `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `DEPLOY_CHECKLIST.md` - Step-by-step checklist
- `USER_MANUAL.md` - User guide
- `CURRENT_STACK.md` - Technology stack

### Getting Help
- Vercel Support: https://vercel.com/support
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

---

## ✅ Deployment Checklist

Before going live:

- [ ] Database created on Neon
- [ ] Environment variables set in Vercel
- [ ] Mock data disabled
- [ ] Tested all forms
- [ ] Tested authentication
- [ ] Tested public portal
- [ ] Checked error logs
- [ ] Set up monitoring
- [ ] Backup strategy in place
- [ ] Team trained on system

---

## 🎉 Ready to Deploy!

Your AidBridge app is production-ready with:
- ✅ Real database (Neon PostgreSQL)
- ✅ Serverless API (Vercel)
- ✅ Authentication (JWT)
- ✅ Role-based access
- ✅ Public portal
- ✅ Mobile responsive
- ✅ Production build configured

**Next Step:** Follow the Quick Deploy steps above!

---

**Version:** 1.0.0  
**Last Updated:** March 3, 2026  
**Status:** ✅ Production Ready

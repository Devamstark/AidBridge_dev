# Mock Data Setup for Testing

## ✅ What's Been Configured

### Mock Data Enabled
The app is now configured to use **mock data** for testing without a backend.

### Files Created/Updated

1. **`src/lib/mockData.js`** - Contains mock data for:
   - User (Admin)
   - Disasters (3 events)
   - Volunteers (3 volunteers)
   - Survivors (3 survivors)
   - Locations (2 locations)
   - Resources (4 resources)
   - Distributions (2 distributions)
   - Emergency Requests (2 requests)
   - Break Glass Events (1 event)

2. **`src/api/client.ts`** - Updated to use mock data
   - Set `USE_MOCK_DATA = true`
   - Returns mock responses instead of API calls

3. **`src/lib/AuthContext.jsx`** - Updated for mock auth
   - Auto-logs in with mock admin user
   - No authentication required for testing

4. **`vite.config.js`** - Fixed environment issues
   - Added `define` configuration
   - Fixed `__DEFINES__` error

5. **`public/manifest.json`** - Created
   - Fixed manifest syntax error

---

## 🎯 Testing the App

### Access the App
Open your browser and visit: **http://localhost:5173**

### What You'll See

1. **Dashboard** - Shows:
   - 2 active disasters
   - 3 survivors registered
   - 2 active locations
   - 3 volunteers
   - Charts and graphs with mock data

2. **Navigation** - All pages working:
   - Dashboard
   - Disasters
   - Survivor Intake
   - Survivors
   - Locations
   - Resources
   - Distributions
   - Volunteers
   - Volunteer Profiles
   - Break-Glass
   - Emergency Dispatch
   - Settings

3. **Logged In As**:
   - **Name:** Admin User
   - **Email:** admin@aidbridge.org
   - **Role:** ADMIN

---

## 📊 Mock Data Summary

### Users
- **Admin User** (admin@aidbridge.org) - ADMIN role

### Disasters
1. **Hurricane Milton** - ACTIVE, Severity 4
2. **California Wildfires** - ACTIVE, Severity 5
3. **Texas Flooding** - MONITORING, Severity 3

### Volunteers
1. **John Smith** - Medical, First Aid (AVAILABLE)
2. **Sarah Johnson** - Logistics, Driving (ON_DUTY)
3. **Maria Garcia** - Translation, Counseling (AVAILABLE)

### Survivors
1. **Robert Williams** - REGISTERED, Household of 4
2. **Emily Brown** - SAFE, Household of 2
3. **Michael Davis** - INJURED, Has diabetes

### Locations
1. **Central High School Shelter** - 342/500 capacity
2. **Community Center** - 85/200 capacity

---

## 🔧 Switching to Real Backend

When you're ready to use the real backend:

1. **Update `src/api/client.ts`:**
   ```typescript
   const USE_MOCK_DATA = false // Change this
   ```

2. **Update `src/lib/AuthContext.jsx`:**
   ```javascript
   // Remove the mockUser import
   // Uncomment the real API call
   const userData = await apiClient.get(endpoints.authMe)
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Add your DATABASE_URL, JWT_SECRET, etc.
   ```

4. **Initialize database:**
   ```bash
   npx prisma migrate dev
   ```

---

## 🎨 Features to Test

### Dashboard
- View KPIs with real mock data
- See charts (Bar chart for distributions, Pie chart for survivors)
- Test pull-to-refresh

### Disasters Page
- View disaster list
- Create new disaster (mock)
- Change disaster status

### Volunteers Page
- View volunteer list
- Add new volunteer
- See skills badges

### Survivors Page
- View survivor list
- Search survivors
- Filter by status

### Settings Page
- Change theme (Light/Dark/Auto)
- Change font size
- Change language
- Adjust contrast

---

## ⚠️ Known Limitations

1. **Data doesn't persist** - Refreshing resets to initial mock data
2. **Create operations** - Show success but don't actually save
3. **No real authentication** - Anyone can access all features
4. **No real-time updates** - Manual refresh needed

---

## 🚀 Next Steps

1. **Test all pages** - Make sure UI looks correct
2. **Test interactions** - Click buttons, fill forms
3. **Check responsive design** - Test on mobile viewport
4. **Report any issues** - Check browser console for errors

---

**Happy Testing! 🎉**

*Created: March 3, 2026*

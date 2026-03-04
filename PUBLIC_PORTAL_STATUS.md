# Public Victim Portal - Implementation Status

## ✅ Phase 1: Core Infrastructure - COMPLETE

### What's Been Built

#### 1. Database Schema ✅
**File:** `prisma/schema.prisma`

Added two new models:

**PublicHelpRequest**
- Stores emergency help requests from public
- Fields: requestId, fullName, phone, location, emergencyType, priority, status, etc.
- Auto-generates Request ID: `REQ-YYYYMMDD-XXX`

**SurvivorRegistration**
- Stores survivor self-registrations
- Fields: caseNumber, firstName, lastName, phone, consent, etc.
- Auto-generates Case Number: `SRV-YYYYMMDD-XXX`

---

#### 2. API Endpoints ✅
**Location:** `api/public/`

**POST /api/public/help**
- Submits emergency help request
- Validates input with Zod
- Returns Request ID
- Status: PENDING

**POST /api/public/register**
- Submits survivor registration
- Validates input with Zod
- Returns Case Number
- Status: PENDING

**GET /api/public/track/:id**
- Tracks help requests or registrations
- Returns status, timeline, details
- Works for both Request IDs and Case Numbers

---

#### 3. Public Pages ✅
**Location:** `src/pages/public/`

**HelpLanding.jsx** (`/help`)
- Public landing page
- 3 action cards:
  - 🚨 Request Emergency Help
  - 📝 Register as Survivor
  - 🔍 Track My Request
- Staff login link
- Emergency contact info (911)

**HelpRequestForm.jsx** (`/help/request`)
- Emergency help request form
- Features:
  - Contact information
  - GPS location button
  - Emergency type selector
  - Priority selector
  - Description field
  - People count
- Success page with Request ID
- Track status button

---

#### 4. App Routes ✅
**File:** `src/App.jsx`

Added public routes:
```javascript
/ → Redirects to /help
/help → Landing page
/help/request → Emergency form
```

---

## 🚧 Phase 2: Remaining Work

### Still Need to Build:

#### 1. Survivor Registration Form
**File:** `src/pages/public/SurvivorRegister.jsx`
**Route:** `/register`

Multi-step form:
- Step 1: Personal Info
- Step 2: Household Members
- Step 3: Medical Needs
- Step 4: Review & Submit

#### 2. Track Request Page
**File:** `src/pages/public/TrackRequest.jsx`
**Route:** `/track`

Features:
- Enter Request ID or Case Number
- Show status timeline
- Show assigned volunteer (if any)
- Contact options

#### 3. Staff View for Public Requests
**File:** `src/pages/EmergencyDispatch.jsx` (update)

Add:
- Public help requests tab
- Filter by status/priority
- Assign volunteer button
- Update status

---

## 📊 Current Status

| Component | Status | File |
|-----------|--------|------|
| Database Schema | ✅ Done | prisma/schema.prisma |
| API: Help Request | ✅ Done | api/public/help.ts |
| API: Register | ✅ Done | api/public/register.ts |
| API: Track | ✅ Done | api/public/track.ts |
| Page: Landing | ✅ Done | pages/public/HelpLanding.jsx |
| Page: Help Form | ✅ Done | pages/public/HelpRequestForm.jsx |
| Page: Register | ⏳ Pending | pages/public/SurvivorRegister.jsx |
| Page: Track | ⏳ Pending | pages/public/TrackRequest.jsx |
| Staff View | ⏳ Pending | pages/EmergencyDispatch.jsx |

---

## 🧪 Testing

### Test Help Request Form:

1. **Open:** http://localhost:5173/help
2. **Click:** "Request Emergency Help"
3. **Fill form:**
   - Name: Test User
   - Phone: 555-123-4567
   - Location: 123 Main St
   - Type: Medical
   - Description: Test emergency
4. **Submit**
5. **Get:** Request ID (e.g., REQ-20260303-123)

### Test API Directly:

```bash
# Submit help request
curl -X POST http://localhost:5173/api/public/help \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "5551234567",
    "location": "Test Location",
    "emergencyType": "MEDICAL",
    "description": "Test emergency request"
  }'

# Response:
{
  "requestId": "REQ-20260303-123",
  "status": "PENDING",
  "message": "Help request submitted..."
}
```

---

## ⚠️ Important Notes

### Database Migration Required

Before testing, run:
```bash
npx prisma migrate dev --name add_survivor_portal
npx prisma generate
```

This creates the new tables in your database.

### Rate Limiting (Future)

Currently no rate limiting. Add before production:
- 3 requests per 15 minutes
- CAPTCHA on forms

### Security (Future)

- Data isolation (survivors see only their data)
- Phone verification for tracking
- Staff-only access to full details

---

## 🎯 Next Steps

1. **Build Survivor Registration Form** (`/register`)
2. **Build Track Request Page** (`/track`)
3. **Update Emergency Dispatch** to show public requests
4. **Add Rate Limiting** middleware
5. **Add CAPTCHA** integration
6. **Test End-to-End**
7. **Deploy to Production**

---

**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 - Complete remaining pages  
**ETA:** 1-2 days

---

*Created: March 3, 2026*

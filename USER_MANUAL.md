# AidBridge User Manual

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Login & Logout](#login--logout)
3. [Dashboard](#dashboard)
4. [Disaster Management](#disaster-management)
5. [Survivor Management](#survivor-management)
6. [Volunteer Management](#volunteer-management)
7. [Resource Management](#resource-management)
8. [Settings](#settings)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### What is AidBridge?

AidBridge is a **disaster relief coordination platform** that helps organizations manage:
- Disaster events
- Survivor registration
- Volunteer coordination
- Resource distribution
- Emergency dispatch

### Accessing the Application

**URL:** http://localhost:5173

**Demo Credentials:**
- **Email:** admin@aidbridge.org
- **Password:** password

---

## 🔐 Login & Logout

### How to Login

1. **Open the application** at http://localhost:5173
2. You'll see the **Login page**
3. **Option A - Quick Login:**
   - Click **"Use Demo Credentials"** button
   - Credentials auto-fill
   - Click **"Sign In"**
4. **Option B - Manual Login:**
   - Enter email: `admin@aidbridge.org`
   - Enter password: `password`
   - Click **"Sign In"**

✅ **Success:** You'll be redirected to the Dashboard

### How to Logout

1. Look at the **bottom of the left sidebar**
2. Find your **profile section** (shows your name)
3. Click the **Logout icon** (door with arrow)
4. You'll be redirected to the Login page

⚠️ **Important:** If you're still seeing the dashboard after logout:
- Clear your browser session: Press `Ctrl+Shift+Delete`
- Or use **Incognito/Private mode** for testing

---

## 📊 Dashboard

### Overview

The Dashboard shows a **real-time overview** of all disaster relief operations.

### Key Metrics (Top Row)

| Metric | Description |
|--------|-------------|
| **Active Disasters** | Number of ongoing disaster events |
| **Survivors Registered** | Total survivors in the system |
| **Active Locations** | Open shelters and facilities |
| **Volunteers** | Active volunteers available |

### Live Operations Map

**Location:** Center of dashboard

**Features:**
- **Map Type Selector** (top-right):
  - 🗺️ **Street** - Default, bright view
  - 🛰️ **Satellite** - Aerial imagery
  - 🏔️ **Terrain** - Topographic map
  - 🌙 **Dark** - Dark mode
  
- **Layer Controls** (below map type):
  - ✅ Disasters - Show/hide disaster markers
  - ✅ Locations - Show/hide shelters
  - ✅ Volunteers - Show/hide volunteer positions

- **Markers:**
  - 🔴 **Red circles** - Disasters (size = severity)
  - 🔵 **Blue pins** - Shelters
  - 🟣 **Purple pins** - Distribution centers
  - 🟢 **Green dots** - Available volunteers

- **Interactions:**
  - **Click** markers to see details
  - **Scroll** to zoom in/out
  - **Drag** to pan the map

### Charts

**Resource Distributions (Bar Chart)**
- Shows items distributed over time
- X-axis: Dates
- Y-axis: Quantity

**Survivor Status (Pie Chart)**
- Shows survivor distribution by status
- Click legend to filter

### Active Disaster List

**Location:** Bottom of dashboard

Shows current active disasters with:
- Disaster name
- Type
- Severity rating
- Status badge

**Actions:**
- Click **"View All"** to see full disaster list

---

## 🌪️ Disaster Management

### View Disasters

1. Click **"Disasters"** in the left sidebar
2. See list of all disasters as cards

### Disaster Card Information

Each card shows:
- **Name** - Event name (e.g., "Hurricane Milton")
- **Type** - Hurricane, Flood, Wildfire, etc.
- **Severity** - 1-5 scale
- **Status** - Active, Monitoring, Resolved
- **Affected Area** - Geographic location
- **Date Created** - When event was added

### Create New Disaster

1. Click **"+ New Disaster"** button (top-right)
2. Fill in the form:
   - **Event Name** (required) - e.g., "California Wildfires"
   - **Disaster Type** - Select from dropdown
   - **Severity** - 1 (Minor) to 5 (Catastrophic)
   - **Affected Area** - City, County, State
   - **Estimated People Affected** - Number
   - **Description** - Details about the event
3. Click **"Create Event"**

### Update Disaster Status

On any disaster card, click status buttons:
- **Activate** - Set as Active
- **Monitor** - Set as Monitoring
- **End** - Mark as Resolved/Closed

### Search Disasters

1. Use the **search bar** at top
2. Type disaster name or location
3. Results filter automatically

---

## 👥 Survivor Management

### View Survivors

1. Click **"Survivors"** in the left sidebar
2. See list of all registered survivors

### Survivor List Views

**Table View (Desktop):**
- Name
- Case Number
- Disaster (associated)
- Status
- Priority
- Household Size
- Registration Date

**Card View (Mobile):**
- Name and photo initial
- Case number
- Status badges
- Quick info

### Register New Survivor

1. Click **"New Intake"** button (top-right)
2. **Step 1: Personal Info**
   - First Name *
   - Last Name *
   - Date of Birth
   - Gender
   - Phone
   - Email
   - Household Size
   - Dependents
   - Address
   - Assign to Disaster
   - Assign to Location
3. **Step 2: Medical & Needs**
   - Medical Needs (select from chips)
   - Current Medications
   - Allergies (select from chips)
   - Mobility Assistance (checkbox)
   - Language Assistance
   - Special Notes
4. **Step 3: Review**
   - Review all information
   - Confirm accuracy
5. Click **"Submit Registration"**

✅ **Success:** Survivor gets a unique Case Number

### Search Survivors

1. Use the **search bar**
2. Search by:
   - First name
   - Last name
   - Case number
3. Results update instantly

### Filter Survivors

**Status Filter:**
- All Statuses
- Registered
- Sheltered
- Assisted
- Relocated

**Priority Filter:**
- All Priorities
- Critical
- High
- Medium
- Low

### View Survivor Details

1. Click on any survivor row/card
2. **Sidebar opens** with full details:
   - Contact Information
   - Household Information
   - Medical Needs
   - Special Needs
   - Registration Details
   - Data Sharing Consent Status

---

## 🦸 Volunteer Management

### View Volunteers

1. Click **"Volunteers"** in the left sidebar
2. See volunteer cards

### Volunteer Card Information

- **Name** - Full name
- **Status** - Available, On Duty, Unavailable
- **Contact** - Phone and email
- **Skills** - Badges showing skills
- **Location Tracker** - Real-time GPS (if enabled)

### Add New Volunteer

1. Click **"+ Add Volunteer"** button
2. Fill in the form:
   - First Name *
   - Last Name *
   - Phone
   - Email *
   - Skills (select multiple)
   - Languages spoken
   - Disaster Assignment (optional)
3. Click **"Add Volunteer"**

### Volunteer Skills

Available skill categories:
- Medical
- Logistics
- Translation
- First Aid
- Counseling
- Driving
- Cooking
- Childcare
- Construction
- IT Support

### Update Volunteer Status

Volunteers can update their own status:
- **Available** - Ready for assignments
- **On Duty** - Currently active
- **Unavailable** - Not available

### Location Tracking

**For Coordinators:**
- See volunteer locations on map
- Track movement in real-time

**For Volunteers:**
- Click **"Share Location"** button
- GPS location updates automatically
- Privacy: Only coordinators can see

---

## 📦 Resource Management

### View Resources

1. Click **"Resources"** in the left sidebar
2. See resource catalog table

### Resource Information

| Column | Description |
|--------|-------------|
| **Name** | Resource name |
| **Category** | Food, Water, Medical, etc. |
| **Unit** | Each, Case, Liter |
| **Par Level** | Minimum stock level |

### Resource Categories

- 🍞 **Food** - Meals, snacks, MREs
- 💧 **Water** - Bottled water, purification
- 🏠 **Shelter** - Blankets, tents, tarps
- 👕 **Clothing** - Clothes, shoes
- 🏥 **Medical** - First aid, medications
- 🧼 **Hygiene** - Soap, sanitizer, toiletries
- 🛠️ **Tools** - Equipment, generators
- 📦 **Other** - Miscellaneous

### Add New Resource

1. Click **"+ Add Resource"** button
2. Fill in the form:
   - Name * (e.g., "Emergency Blanket")
   - Type (e.g., "Wool Blanket 60x80")
   - Category *
   - Unit (e.g., "each", "case")
   - Par Level (minimum stock)
3. Click **"Add Resource"**

---

## 🚚 Distributions

### View Distributions

1. Click **"Distributions"** in the left sidebar
2. See distribution history table

### Distribution Information

| Column | Description |
|--------|-------------|
| **Resource** | What was distributed |
| **Quantity** | How many |
| **Type** | Individual, Bulk, Emergency |
| **From Location** | Where from |
| **Disaster** | Associated disaster |
| **Date** | When distributed |

### Record Distribution

1. Click **"+ Record Distribution"** button
2. Fill in the form:
   - Disaster Event *
   - Resource *
   - Quantity *
   - From Location
   - Distribution Type
   - Notes
3. Click **"Record Distribution"**

---

## 📍 Locations

### View Locations

1. Click **"Locations"** in the left sidebar
2. See location cards

### Location Card Information

- **Name** - Facility name
- **Type** - Shelter, Warehouse, etc.
- **Status** - Open, Full, Closed
- **Address** - Full address
- **Occupancy** - Current / Capacity
- **Progress Bar** - Visual occupancy indicator
- **Contact** - Phone number

### Location Types

- 🏫 **Shelter** - Emergency housing
- 🏥 **Hospital** - Medical facility
- 🏬 **Warehouse** - Storage facility
- 📍 **Distribution Center** - Resource distribution
- 🚨 **Command Center** - Operations hub

### Add New Location

1. Click **"+ Add Location"** button
2. Fill in the form:
   - Name *
   - Type *
   - Status *
   - Address
   - Capacity
   - Disaster Assignment
   - Manager Name
   - Contact Phone
3. Click **"Add Location"**

---

## 🚨 Emergency Dispatch

### Access Emergency Dispatch

1. Click **"Emergency Dispatch"** in the left sidebar

### Emergency Dispatch Dashboard

**KPI Cards (Top Row):**
- **Active** - Current active requests
- **Available Volunteers** - Ready for deployment
- **Critical P0** - Life-threatening emergencies
- **Fatigued** - Volunteers needing rest

### View Emergency Requests

**Left Panel - Request Feed:**
- Shows all incoming requests
- Sorted by time (newest first)
- Color-coded by priority:
  - 🔴 **P0** - Critical (red border)
  - 🟠 **P1** - High priority
  - 🟡 **P2** - Medium priority
  - 🟢 **P3** - Low priority

### Create Emergency Request

1. Click **"+ New Request"** button
2. Fill in the form:
   - Type (Medical, Rescue, Fire, etc.)
   - Priority (P0-P3)
   - Address / Location
   - Description
3. Click **"Submit Request"**

### Assign Volunteers

1. **Click on a request** from the feed
2. **Right panel opens** with details
3. See **available volunteers** list
4. Click **"Assign"** next to volunteer names
5. Or click **"Dispatch All Available"**

### Request Status

- **Pending** - Awaiting assignment
- **Notifying** - Volunteers being contacted
- **Assigned** - Volunteers assigned
- **In Progress** - Being handled
- **Resolved** - Completed

---

## ⚙️ Settings

### Access Settings

1. Click **"Settings"** in the left sidebar
2. Or click your **profile** → Settings

### Account Settings

**Profile Information:**
- Full Name - Edit your name
- Email - View only (cannot change)
- Phone - Update phone number
- Role - View only

### Appearance Settings

**Theme:**
- ☀️ **Light** - Bright interface
- 🌙 **Dark** - Dark interface (default)
- 🖥️ **Auto** - Follows system preference

**Color Contrast:**
- Standard - Normal contrast
- Enhanced - Higher contrast
- High Contrast - Maximum contrast

**Font Size:**
- Small - 14px
- Medium - 16px (default)
- Large - 18px
- Extra Large - 20px

### Language & Region

**Display Language:**
- English
- Español (Spanish)
- 中文 (Chinese)
- বাংলা (Bengali)

**Date Format:**
- MM/DD/YYYY (US)
- DD/MM/YYYY (International)
- YYYY-MM-DD (ISO)

**Time Format:**
- 12-hour (AM/PM)
- 24-hour (Military)

**Timezone:**
- Select your local timezone

### Notifications

**Toggle Options:**
- ✅ Push Notifications
- ✅ Email Notifications
- ✅ Sound Alerts

### Accessibility

**Features:**
- Screen Reader Optimizations
- Reduce Motion (animations)
- Keyboard Navigation Hints
- Focus Indicators
- Color Blind Mode

### Offline & Sync

**Settings:**
- Auto Offline Detection
- Lite Mode (low bandwidth)
- Auto Sync When Online
- Sync Frequency
- Sync Over Cellular Data

### Data & Privacy

**Actions:**
- 📥 Download My Data
- 🗑️ Clear Local Cache
- ❌ Delete Account

### About

**Information:**
- Version number
- Build date
- Platform
- Links to:
  - Terms of Service
  - Privacy Policy
  - Contact Support
  - Report a Bug

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette |
| `Ctrl + /` | Show keyboard shortcuts |
| `Esc` | Close modals/dialogs |

### Navigation

| Shortcut | Action |
|----------|--------|
| `G + D` | Go to Dashboard |
| `G + S` | Go to Survivors |
| `G + V` | Go to Volunteers |
| `G + L` | Go to Locations |
| `G + R` | Go to Resources |

### Map Controls

| Key | Action |
|-----|--------|
| `+` | Zoom in |
| `-` | Zoom out |
| `↑` | Pan north |
| `↓` | Pan south |
| `←` | Pan west |
| `→` | Pan east |

### Forms

| Shortcut | Action |
|----------|--------|
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Enter` | Submit form |
| `Ctrl + S` | Save (in forms) |

---

## 🔧 Troubleshooting

### Common Issues

#### "I can't logout - it redirects back to dashboard"

**Solution:**
1. Clear browser session:
   - Press `Ctrl + Shift + Delete`
   - Select "Cookies and site data"
   - Click "Clear data"
2. Or use **Incognito/Private mode**
3. Or manually clear:
   ```javascript
   sessionStorage.clear()
   ```

#### "Map is not loading"

**Solution:**
1. Check internet connection
2. Refresh the page (`F5`)
3. Clear browser cache
4. Try a different map type (click map type selector)

#### "I can't see any data"

**Solution:**
1. Refresh the page
2. Check if you're logged in
3. Check browser console for errors (`F12`)
4. Try logging out and back in

#### "Forms are not submitting"

**Solution:**
1. Check all required fields (marked with *)
2. Check for validation errors (red text)
3. Try refreshing and resubmitting
4. Check browser console for errors

#### "The app looks broken after update"

**Solution:**
1. Hard refresh: `Ctrl + F5`
2. Clear cache: `Ctrl + Shift + Delete`
3. Try incognito mode
4. Contact support if issue persists

### Getting Help

**In-App Help:**
1. Go to **Settings**
2. Scroll to **"About & Help"**
3. Click **"Contact Support"**

**Browser Console:**
1. Press `F12` to open DevTools
2. Click **"Console"** tab
3. Look for red error messages
4. Take screenshot and send to support

---

## 📱 Mobile Usage

### Responsive Design

AidBridge is **mobile-first** and works on:
- 📱 Smartphones (iOS, Android)
- 📱 Tablets (iPad, Android tablets)
- 💻 Desktop (Windows, Mac, Linux)

### Mobile Navigation

**Bottom Tab Bar:**
- Dashboard
- Disasters
- Survivors
- Settings

**Hamburger Menu:**
- Tap ☰ icon for full menu
- Shows all pages

### Mobile Features

- **Touch-friendly** buttons and inputs
- **Pull to refresh** on lists
- **Swipe** to navigate
- **Tap twice** on tab to scroll to top

---

## 🎓 Best Practices

### Data Entry

✅ **DO:**
- Fill all required fields
- Double-check case numbers
- Use consistent naming
- Add detailed notes
- Update status regularly

❌ **DON'T:**
- Leave required fields blank
- Use special characters in names
- Create duplicate entries
- Share sensitive data publicly

### Privacy & Security

✅ **DO:**
- Log out when finished
- Keep credentials private
- Use strong passwords
- Respect data sharing consent

❌ **DON'T:**
- Share login credentials
- Access without authorization
- Share survivor data externally
- Ignore consent restrictions

### Performance

✅ **DO:**
- Close unused tabs
- Clear cache regularly
- Use modern browsers
- Keep app updated

❌ **DON'T:**
- Open multiple instances
- Use outdated browsers
- Ignore update notifications

---

## 📞 Support

### Contact Support

**Email:** support@aidbridge.org

**In-App:**
1. Settings → About & Help
2. Click "Contact Support"

### Report a Bug

1. Settings → About & Help
2. Click "Report a Bug"
3. Describe the issue
4. Attach screenshots if possible

### Feature Requests

1. Settings → About & Help
2. Click "Request Feature"
3. Describe what you need
4. Submit for review

---

**End of User Manual**

*Version: 1.0.0*  
*Last Updated: March 3, 2026*

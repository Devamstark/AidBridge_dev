# AidBridge - Current Technology Stack

**Last Updated:** March 3, 2026  
**Version:** 1.0.0 (Post-Migration)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AidBridge Platform                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │   Frontend (Vite)    │         │  Backend (Vercel)    │  │
│  │   React 18.2         │◄───────►│  Serverless API      │  │
│  │   TypeScript/JSX     │  REST   │  Prisma ORM          │  │
│  └──────────────────────┘         └──────────────────────┘  │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │   TanStack Query     │         │  Neon PostgreSQL     │  │
│  │   (Server State)     │         │  (Database)          │  │
│  └──────────────────────┘         └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Core Technologies

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Library |
| **React DOM** | 18.2.0 | DOM Rendering |
| **React Router DOM** | 6.26.0 | Client-side Routing |

### Build & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 6.1.0 | Build Tool / Dev Server |
| **@vitejs/plugin-react** | 4.3.4 | React Plugin for Vite |
| **TypeScript** | 5.8.2 | Type Checking (via JSDoc) |
| **tsx** | 4.7.0 | TypeScript Execution |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Prisma** | 5.10.0 | ORM / Database Toolkit |
| **@prisma/client** | 5.10.0 | Database Client |
| **Neon PostgreSQL** | - | Serverless PostgreSQL Database |
| **Vercel Serverless Functions** | - | API Backend (Node.js) |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack Query (React Query)** | 5.84.1 | Server State Management |
| **React Context API** | - | Global State (Auth, i18n) |
| **localStorage** | - | Client-side Persistence |

---

## 🎨 UI & Styling

### CSS Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS Framework |
| **PostCSS** | 8.5.3 | CSS Processing |
| **Autoprefixer** | 10.4.20 | CSS Vendor Prefixes |
| **tailwindcss-animate** | 1.0.7 | Tailwind Animation Plugin |

### UI Component Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| **shadcn/ui** | - | Component Architecture (New York style) |
| **Radix UI** | Various | Headless UI Primitives (40+ components) |

### Radix UI Components (40+)
- Accordion, Alert Dialog, Aspect Ratio, Avatar
- Checkbox, Collapsible, Context Menu
- Dialog, Dropdown Menu, Hover Card
- Label, Menubar, Navigation Menu
- Popover, Progress, Radio Group
- Scroll Area, Select, Separator
- Slider, Switch, Tabs, Toast
- Toggle, Toggle Group, Tooltip

### Icons
| Technology | Version | Purpose |
|------------|---------|---------|
| **Lucide React** | 0.475.0 | Icon Library |

### Animations & Visual Effects
| Technology | Version | Purpose |
|------------|---------|---------|
| **Framer Motion** | 11.16.4 | Animation Library |
| **canvas-confetti** | 1.9.4 | Confetti Effects |

---

## 📝 Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.54.2 | Form Management |
| **Zod** | 3.24.2 | Schema Validation |
| **@hookform/resolvers** | 4.1.2 | Zod Resolver for React Hook Form |

---

## 📊 Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 2.15.4 | Charts (Bar, Pie, Line, etc.) |
| **React Google Maps** (@vis.gl) | 1.0.0 | Map Integration |
| **React Leaflet** | 4.2.1 | Alternative Map Library |
| **Three.js** | 0.171.0 | 3D Graphics |

---

## 📅 Date & Time

| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 3.6.0 | Date Manipulation |
| **React Day Picker** | 8.10.1 | Date Picker Component |
| **Moment** | 2.30.1 | Legacy Date Handling |

---

## 🔐 Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| **JWT (jose)** | 5.2.0 | JWT Token Generation/Verification |
| **bcryptjs** | 2.4.3 | Password Hashing |
| **@types/bcryptjs** | 2.4.6 | TypeScript Types for bcrypt |

### Auth Features
- JWT-based authentication
- httpOnly cookie sessions
- Role-based access control (Admin, Coordinator, Volunteer)
- Break-glass emergency override mode
- Token refresh mechanism

---

## 🌐 Internationalization (i18n)

**Custom Implementation** with support for:
- **English (en)** - Default
- **Spanish (es)**
- **Chinese (zh)**
- **Bengali (bn)**

Features:
- Language switching
- Fallback to English
- User preference persistence in database

---

## ♿ Accessibility (a11y)

### Features
- **Font Size Scaling** - Small (14px), Medium (16px), Large (18px), X-Large (20px)
- **Contrast Modes** - Standard, Enhanced, High Contrast
- **Theme Support** - Light, Dark modes
- **Screen Reader Optimizations**
- **Reduced Motion** support
- **Keyboard Navigation** hints
- **Focus Indicators**
- **Color Blind Modes** - Protanopia, Deuteranopia, Tritanopia

### User Preferences (stored in database)
- `fontSize` - UI text scaling
- `contrast` - Contrast level
- `theme` - Light/Dark mode
- `language` - Display language

---

## 📡 HTTP Client

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.6.0 | HTTP Client |

### Features
- Automatic JWT token injection
- 401 error handling with redirect
- Centralized error handling
- Request/Response interceptors

---

## 📦 Additional Libraries

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **lodash** | 4.17.21 | Utility Functions |
| **clsx** | 2.1.1 | Conditional className |
| **tailwind-merge** | 3.0.2 | Tailwind Class Merging |
| **class-variance-authority** | 0.7.1 | Variant Class Management |
| **cmdk** | 1.0.0 | Command Palette |

### Notifications
| Technology | Version | Purpose |
|------------|---------|---------|
| **Sonner** | 2.0.1 | Toast Notifications |
| **React Hot Toast** | 2.6.0 | Alternative Toast Library |

### Specialized UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| **embla-carousel-react** | 8.5.2 | Carousel/Slider |
| **vaul** | 1.1.2 | Drawer Component |
| **input-otp** | 1.4.2 | OTP Input |
| **react-resizable-panels** | 2.1.7 | Resizable Panels |
| **next-themes** | 0.4.4 | Theme Management |

### Rich Text & Content
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Markdown** | 9.0.1 | Markdown Rendering |
| **React Quill** | 2.0.0 | Rich Text Editor |
| **html2canvas** | 1.4.1 | Screenshot Capture |
| **jsPDF** | 4.0.0 | PDF Generation |

### Drag & Drop
| Technology | Version | Purpose |
|------------|---------|---------|
| **@hello-pangea/dnd** | 17.0.0 | Drag and Drop (react-beautiful-dnd fork) |

---

## 🧪 Code Quality

### Linting
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.19.0 | Code Linting |
| **@eslint/js** | 9.19.0 | ESLint Recommended Config |
| **eslint-plugin-react** | 7.37.4 | React Linting Rules |
| **eslint-plugin-react-hooks** | 5.0.0 | Hooks Rules |
| **eslint-plugin-react-refresh** | 0.4.18 | Fast Refresh |
| **eslint-plugin-unused-imports** | 4.3.0 | Unused Import Detection |
| **globals** | 15.14.0 | Global Variables |

### Type Checking
| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.8.2 | JSDoc Type Checking |
| **@types/node** | 22.13.5 | Node.js Types |
| **@types/react** | 18.2.66 | React Types |
| **@types/react-dom** | 18.2.22 | React DOM Types |

---

## 🗂 Database Schema (13 Models)

| Model | Description |
|-------|-------------|
| **User** | User accounts with auth & preferences |
| **Session** | User sessions (NextAuth) |
| **Account** | OAuth accounts (NextAuth) |
| **Volunteer** | Volunteer profiles & status |
| **VolunteerLocationHistory** | Volunteer location tracking |
| **Disaster** | Disaster events |
| **Survivor** | Registered survivors |
| **Location** | Facilities & shelters |
| **Resource** | Resource inventory |
| **Distribution** | Resource distributions |
| **DistributionItem** | Distribution line items |
| **EmergencyRequest** | Emergency dispatch requests |
| **Mission** | Volunteer missions |
| **Inventory** | Disaster-specific inventory |
| **AuditLog** | System audit trail |
| **BreakGlassEvent** | Emergency access events |

---

## 📁 Project Structure

```
aidbridge/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── api/                       # Vercel Serverless Functions
│   ├── _lib/                  # Shared utilities
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # Auth middleware
│   │   └── utils.ts           # HTTP utilities
│   ├── auth/                  # Auth endpoints
│   ├── disasters/             # Disaster endpoints
│   ├── volunteers/            # Volunteer endpoints
│   ├── survivors/             # Survivor endpoints
│   ├── locations/             # Location endpoints
│   ├── resources/             # Resource endpoints
│   ├── distributions/         # Distribution endpoints
│   ├── dispatch/              # Emergency dispatch
│   ├── alerts/                # Alert endpoints
│   └── break-glass/           # Break-glass access
├── src/
│   ├── api/                   # Frontend API layer
│   │   ├── client.ts          # Axios client
│   │   └── endpoints.ts       # Endpoint definitions
│   ├── components/            # React components
│   │   ├── ui/                # shadcn components (56 files)
│   │   ├── maps/              # Map components
│   │   ├── i18n/              # Internationalization
│   │   ├── volunteers/        # Volunteer components
│   │   ├── disasters/         # Disaster components
│   │   ├── dispatch/          # Dispatch components
│   │   └── alerts/            # Alert components
│   ├── hooks/                 # React Query hooks
│   │   ├── useDisasters.ts
│   │   ├── useVolunteers.ts
│   │   ├── useSurvivors.ts
│   │   ├── useLocations.ts
│   │   ├── useResources.ts
│   │   ├── useDistributions.ts
│   │   └── useEmergencyDispatch.ts
│   ├── lib/                   # Core utilities
│   │   ├── AuthContext.jsx    # Auth provider
│   │   └── ...
│   ├── pages/                 # Application pages (12)
│   └── utils/                 # Helper functions
├── .env.example               # Environment template
├── vercel.json                # Vercel configuration
└── package.json               # Dependencies
```

---

## 🚀 Deployment

### Platform
- **Vercel** - Frontend hosting & serverless functions
- **Neon** - Serverless PostgreSQL database

### Environment Variables Required
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="..."
NEXTAUTH_SECRET="..."

# Authentication
JWT_SECRET="..."
NEXTAUTH_SECRET="..."
```

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run lint         # ESLint check
```

---

## 📊 Key Metrics

| Category | Count |
|----------|-------|
| **Total Dependencies** | 75+ |
| **UI Components (Radix)** | 40+ |
| **Custom React Hooks** | 7 |
| **API Endpoints** | 17 |
| **Database Models** | 13 |
| **Application Pages** | 12 |
| **Supported Languages** | 4 |
| **shadcn UI Components** | 56 |

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Role-based access control
- ✅ Secure httpOnly cookies
- ✅ CORS configuration
- ✅ Rate limiting ready

---

## ♿ Accessibility Compliance

- ✅ Font size scaling (4 levels)
- ✅ High contrast mode
- ✅ Color blind modes (3 types)
- ✅ Keyboard navigation
- ✅ Screen reader optimized
- ✅ Reduced motion support
- ✅ Focus indicators

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Bottom navigation for mobile
- ✅ Sidebar for desktop
- ✅ Touch-friendly interactions
- ✅ Safe area insets (notch support)
- ✅ Double-tap to scroll

---

*This document reflects the technology stack as of March 3, 2026, post-migration from Base44 to Vercel.*

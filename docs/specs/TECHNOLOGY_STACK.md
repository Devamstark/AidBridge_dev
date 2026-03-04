# AidBridge - Technology Stack & Features Documentation

## Overview

**AidBridge** is a disaster relief coordination platform built with React and Base44 SDK. The application enables real-time management of disasters, survivors, volunteers, locations, and resource distributions.

---

## Core Technologies

### Framework & Runtime
- **React 18.2.0** - UI library
- **React DOM 18.2.0** - DOM rendering
- **React Router DOM 6.26.0** - Client-side routing

### Build & Development
- **Vite 6.1.0** - Build tool and dev server
- **@vitejs/plugin-react 4.3.4** - React plugin for Vite
- **TypeScript 5.8.2** - Type checking (via jsconfig)
- **Node.js** - Runtime environment

### Backend & API
- **Base44 SDK 0.8.18** - Backend-as-a-Service integration
- **Base44 Vite Plugin 0.2.17** - HMR and visual edit support
- **TanStack Query (React Query) 5.84.1** - Server state management

---

## UI & Styling

### CSS Framework
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5.3** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixes
- **tailwindcss-animate 1.0.7** - Tailwind animation plugin

### UI Component Libraries
- **shadcn/ui (New York style)** - Component architecture
- **Radix UI** - Headless UI primitives:
  - Accordion, Alert Dialog, Aspect Ratio, Avatar
  - Checkbox, Collapsible, Context Menu
  - Dialog, Dropdown Menu, Hover Card
  - Label, Menubar, Navigation Menu
  - Popover, Progress, Radio Group
  - Scroll Area, Select, Separator
  - Slider, Switch, Tabs
  - Toast, Toggle, Toggle Group, Tooltip

### Icons
- **Lucide React 0.475.0** - Icon library (configured as shadcn icon library)

### Animations
- **Framer Motion 11.16.4** - Animation library
- **canvas-confetti 1.9.4** - Confetti effects

---

## Forms & Validation

- **React Hook Form 7.54.2** - Form management
- **Zod 3.24.2** - Schema validation
- **@hookform/resolvers 4.1.2** - Zod resolver for React Hook Form

---

## Data Visualization

- **Recharts 2.15.4** - Charts (Bar, Pie, Line, etc.)
- **React Google Maps (@vis.gl/react-google-maps) 1.0.0** - Map integration
- **React Leaflet 4.2.1** - Alternative map library
- **Three.js 0.171.0** - 3D graphics

---

## Date & Time

- **date-fns 3.6.0** - Date manipulation
- **React Day Picker 8.10.1** - Date picker component
- **Moment 2.30.1** - Legacy date handling

---

## State Management

- **React Context API** - Global state (Auth, i18n)
- **TanStack Query** - Server state caching
- **localStorage** - Client-side persistence

---

## Authentication & Authorization

- **Base44 Auth** - User authentication
- **Custom AuthContext** - Auth state management
- **Token-based sessions** - JWT tokens

---

## Internationalization (i18n)

Custom i18n implementation with support for:
- **English (en)** - Default
- **Spanish (es)**
- **Chinese (zh)**
- **Bengali (bn)**

Features:
- Language switching
- Fallback to English
- User preference persistence

---

## Accessibility (a11y)

### Features
- **Font Size Scaling** - Small, Medium, Large, X-Large
- **Contrast Modes** - Standard, Enhanced, High Contrast
- **Theme Support** - Light, Dark modes
- **Screen Reader Optimizations**
- **Reduced Motion** support
- **Keyboard Navigation** hints
- **Focus Indicators**
- **Color Blind Modes** - Protanopia, Deuteranopia, Tritanopia

### User Preferences (stored in user DB)
- `fontSize` - UI text scaling
- `contrast` - Contrast level
- `theme` - Light/Dark mode
- `language` - Display language

---

## Offline Support

- **Online/Offline Detection** - Network status monitoring
- **Auto-offline mode** - Automatic fallback
- **Lite Mode** - Reduced data usage
- **Sync Settings** - Configurable sync frequency
- **Conflict Resolution** - Manual/Automatic options

---

## Rich Text & Content

- **React Markdown 9.0.1** - Markdown rendering
- **React Quill 2.0.0** - Rich text editor
- **html2canvas 1.4.1** - Screenshot capture
- **jsPDF 4.0.0** - PDF generation

---

## Drag & Drop

- **@hello-pangea/dnd 17.0.0** - Drag and drop (react-beautiful-dnd fork)

---

## Additional Libraries

### Utilities
- **lodash 4.17.21** - Utility functions
- **clsx 2.1.1** - Conditional className
- **tailwind-merge 3.0.2** - Tailwind class merging
- **class-variance-authority 0.7.1** - Variant class management
- **cmdk 1.0.0** - Command palette

### Notifications
- **Sonner 2.0.1** - Toast notifications
- **React Hot Toast 2.6.0** - Alternative toast library

### UI Components (Specialized)
- **embla-carousel-react 8.5.2** - Carousel/slider
- **vaul 1.1.2** - Drawer component
- **input-otp 1.4.2** - OTP input
- **react-resizable-panels 2.1.7** - Resizable panels
- **next-themes 0.4.4** - Theme management

---

## Code Quality

### Linting
- **ESLint 9.19.0** - Code linting
- **@eslint/js 9.19.0** - ESLint recommended config
- **eslint-plugin-react 7.37.4** - React linting rules
- **eslint-plugin-react-hooks 5.0.0** - Hooks rules
- **eslint-plugin-react-refresh 0.4.18** - Fast refresh
- **eslint-plugin-unused-imports 4.3.0** - Unused import detection
- **globals 15.14.0** - Global variables

### Type Checking
- **TypeScript 5.8.2** - JSDoc type checking
- **@types/node, react, react-dom** - Type definitions

---

## Project Structure

```
aidbridge/
├── functions/              # Cloud Functions (TypeScript)
│   ├── disasterAlertVolunteers.ts
│   ├── triggerEmergencyDispatch.ts
│   └── volunteerStatusCheck.ts
├── src/
│   ├── api/               # API clients
│   │   └── base44Client.js
│   ├── components/        # React components
│   │   ├── alerts/        # Alert components
│   │   ├── disasters/     # Disaster-related
│   │   ├── dispatch/      # Emergency dispatch
│   │   ├── i18n/          # Internationalization
│   │   ├── maps/          # Map components
│   │   ├── ui/            # shadcn UI components (56 files)
│   │   └── volunteers/    # Volunteer components
│   ├── hooks/             # Custom React hooks
│   │   └── use-mobile.jsx
│   ├── lib/               # Core utilities
│   │   ├── AuthContext.jsx
│   │   ├── NavigationTracker.jsx
│   │   ├── query-client.js
│   │   └── utils.js
│   ├── pages/             # Application pages (12 pages)
│   │   ├── Dashboard.jsx
│   │   ├── Disasters.jsx
│   │   ├── Survivors.jsx
│   │   ├── SurvivorIntake.jsx
│   │   ├── Locations.jsx
│   │   ├── Resources.jsx
│   │   ├── Distributions.jsx
│   │   ├── Volunteers.jsx
│   │   ├── VolunteerProfiles.jsx
│   │   ├── BreakGlass.jsx
│   │   ├── EmergencyDispatch.jsx
│   │   └── Settings.jsx
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Root component
│   ├── Layout.jsx         # Main layout with sidebar
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   └── pages.config.js    # Auto-generated page routing
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── components.json        # shadcn/ui configuration
├── jsconfig.json          # JavaScript/TypeScript config
├── eslint.config.js       # ESLint configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

---

## Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Operations overview with KPIs, maps, charts |
| Disasters | `/Disasters` | Disaster event management |
| Survivor Intake | `/SurvivorIntake` | Register new survivors |
| Survivors | `/Survivors` | Survivor database |
| Locations | `/Locations` | Facility/location management |
| Resources | `/Resources` | Resource inventory |
| Distributions | `/Distributions` | Resource distribution tracking |
| Volunteers | `/Volunteers` | Volunteer management |
| Volunteer Profiles | `/VolunteerProfiles` | Detailed volunteer info |
| Break-Glass | `/BreakGlass` | Emergency access mode |
| Emergency Dispatch | `/EmergencyDispatch` | Real-time emergency coordination |
| Settings | `/Settings` | User preferences & app settings |

---

## Key Features

### Dashboard
- KPI cards (Active Disasters, Survivors, Locations, Volunteers)
- Live operations map (Google Maps integration)
- Distribution trends (Bar chart)
- Survivor status breakdown (Pie chart)
- Active disaster list
- Pull-to-refresh support

### Layout
- Responsive sidebar navigation
- Mobile bottom navigation
- Online/Offline status indicator
- Real-time clock
- Theme toggle (Light/Dark)
- User profile display
- Accessibility settings integration

### Navigation
- Desktop: Full sidebar with all pages
- Mobile: Tab bar with key pages (Dashboard, Disasters, Survivors, Settings)
- Child page handling with back button
- Double-tap to scroll to top

---

## Design System

### Brand Colors
- **AidBridge Red**: `#D72836` (Primary)
- **AidBridge Blue**: `#2F4F79` (Secondary)
- **Deep Navy**: `#0d1527` (Dark background)
- **Off-White**: `#f5f7fa` (Light background)

### CSS Variables
- Theme colors (primary, secondary, accent, destructive)
- Sidebar colors
- Chart colors (5-color palette)
- Border radius scale
- Custom animations (accordion)

### Font Scaling
- Small: 14px
- Medium: 16px (default)
- Large: 18px
- X-Large: 20px

---

## Cloud Functions

TypeScript-based serverless functions:
1. **disasterAlertVolunteers.ts** - Alert volunteers for disasters
2. **triggerEmergencyDispatch.ts** - Trigger emergency response
3. **volunteerStatusCheck.ts** - Monitor volunteer status

---

## Environment Variables

Required in `.env.local`:
```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run local` | Local development (alias) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript check |
| `npm run preview` | Preview production build |

---

## Browser Support

- Modern browsers (ES2022+)
- Mobile-first responsive design
- PWA support (manifest.json)
- Safe area insets (notch support)

---

## Deployment

- **Base44 Platform** - Primary hosting
- **Git Integration** - Sync with Base44 Builder
- **Publish via Base44.com** - One-click deployment

---

## Documentation & Support

- **Docs**: https://docs.base44.com/Integrations/Using-GitHub
- **Support**: https://app.base44.com/support
- **Base44**: https://base44.com

---

*Generated: March 3, 2026*

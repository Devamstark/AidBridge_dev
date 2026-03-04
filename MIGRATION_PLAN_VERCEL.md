# AidBridge: Base44 to Vercel Migration Plan

## Executive Summary

This document provides a complete migration plan for moving AidBridge from Base44 to Vercel with a modern open backend architecture. The migration replaces all Base44 dependencies while maintaining existing features, accessibility, and offline support.

**NEW:** Includes Public Victim Portal implementation for disaster survivors to request help directly.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Target Architecture](#2-target-architecture)
3. [Phase 1: Project Setup & Base44 Removal](#3-phase-1-project-setup--base44-removal)
4. [Phase 2: Database Design (Prisma)](#4-phase-2-database-design-prisma)
5. [Phase 3: Vercel API Structure](#5-phase-3-vercel-api-structure)
6. [Phase 4: Authentication System](#6-phase-4-authentication-system)
7. [Phase 5: Frontend API Client](#7-phase-5-frontend-api-client)
8. [Phase 6: Cloud Functions Migration](#8-phase-6-cloud-functions-migration)
9. [Phase 7: Stripe Integration](#9-phase-7-stripe-integration)
10. [Phase 8: Offline Support](#10-phase-8-offline-support)
11. [Phase 9: Deployment](#11-phase-9-deployment)
12. [Migration Checklist](#12-migration-checklist)
13. [Phase 10: Public Victim Portal](#13-phase-10-public-victim-portal)

---

## 1. Current State Analysis

### Base44 SDK Usage Summary

| Category | Count | Details |
|----------|-------|---------|
| **Files Using Base44** | 25 files | Across src/ directory |
| **Total SDK Usages** | 115+ | Method calls and imports |
| **Entities** | 13 | Volunteer, Disaster, Survivor, Location, Resource, Distribution, EmergencyRequest, Mission, Inventory, AuditLog, BreakGlassEvent, VolunteerLocationHistory, User |
| **Auth Methods** | 4 | me(), logout(), updateMe(), redirectToLogin() |
| **Entity Operations** | 6 | list(), create(), update(), filter(), delete(), subscribe() |
| **Cloud Functions** | 3 | disasterAlertVolunteers, triggerEmergencyDispatch, volunteerStatusCheck |

### Files Requiring Changes

**Delete:**
- `src/api/base44Client.js`
- `/functions/` (entire folder)

**Rewrite:**
- `src/lib/AuthContext.jsx` - Complete auth system replacement
- `src/lib/app-params.js` - Remove base44 references
- `src/lib/NavigationTracker.jsx` - Remove appLogs

**Update (22 files):**
- All pages using `base44.entities.*`
- All components using base44 SDK

---

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐         ┌──────────────────────────┐   │
│  │   FRONTEND (Vite)   │         │   SERVERLESS FUNCTIONS   │   │
│  │   React 18 + Vite   │         │   /api/* (Node.js)       │   │
│  │   Tailwind + shadcn │◄───────►│   Prisma ORM             │   │
│  │   Deploy: Vercel    │   REST  │   Deploy: Vercel         │   │
│  └─────────────────────┘         └──────────────────────────┘   │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────┐         ┌──────────────────────────┐   │
│  │   Browser Storage   │         │   Neon PostgreSQL        │   │
│  │   - localStorage    │         │   - 13 Tables            │   │
│  │   - IndexedDB       │         │   - Row Level Security   │   │
│  │   - Service Worker  │         │   - Connection Pooling   │   │
│  └─────────────────────┘         └──────────────────────────┘   │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                    │
│                          │   Stripe API     │                    │
│                          │   Payments       │                    │
│                          └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Project Setup & Base44 Removal

### 3.1 Remove Base44 Dependencies

**package.json Changes:**

```json
{
  "dependencies": {
    // REMOVE these:
    // "@base44/sdk": "^0.8.18",
    // "@base44/vite-plugin": "^0.2.17",
    
    // ADD these:
    "@neondatabase/serverless": "^0.9.0",
    "@prisma/client": "^5.10.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "@vercel/kv": "^1.0.1",
    "stripe": "^15.0.0",
    "axios": "^1.6.0",
    "superjson": "^2.2.0"
  },
  "devDependencies": {
    "prisma": "^5.10.0"
  }
}
```

### 3.2 Update vite.config.js

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  logLevel: 'error',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 3.3 Environment Variables

**.env.local:**
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host.neon.tech/aidbridge?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-key-min-32-characters-long"
JWT_REFRESH_SECRET="another-super-secret-key-min-32-chars"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:5173"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
VITE_APP_URL="http://localhost:5173"
VITE_API_URL="/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Production
PRODUCTION_URL="https://your-app.vercel.app"
```

### 3.4 New Folder Structure

```
aidbridge/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── [...nextauth].ts
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── me.ts
│   ├── disasters/
│   │   ├── index.ts
│   │   └── [id].ts
│   ├── survivors/
│   │   ├── index.ts
│   │   └── [id].ts
│   ├── volunteers/
│   │   ├── index.ts
│   │   ├── [id].ts
│   │   └── status-check.ts
│   ├── locations/
│   │   └── index.ts
│   ├── resources/
│   │   └── index.ts
│   ├── distributions/
│   │   └── index.ts
│   ├── dispatch/
│   │   ├── trigger.ts
│   │   └── requests.ts
│   ├── alerts/
│   │   └── disaster.ts
│   ├── stripe/
│   │   ├── create-payment-intent.ts
│   │   └── webhook.ts
│   └── trpc/
│       └── [trpc].ts
├── src/
│   ├── api/
│   │   ├── client.ts       # NEW: Axios client
│   │   └── endpoints.ts    # NEW: API endpoints
│   ├── lib/
│   │   ├── auth.ts         # NEW: Auth utilities
│   │   ├── prisma.ts       # NEW: Prisma client
│   │   └── ...
│   └── ...
├── vercel.json
├── .env.local
└── package.json
```

---

## 4. Phase 2: Database Design (Prisma)

### 4.1 Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String?
  fullName        String
  phone           String?
  role            Role      @default(VOLUNTEER)
  language        String    @default("en")
  fontSize        String    @default("MEDIUM")
  contrast        String    @default("STANDARD")
  theme           String    @default("DARK")
  emailVerified   DateTime?
  image           String?
  breakGlassAccess Boolean  @default(false)
  isActive        Boolean   @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]
  volunteerProfile Volunteer?
  auditLogs       AuditLog[]
  createdDistributions Distribution[]

  @@index([email])
  @@index([role])
}

enum Role {
  ADMIN
  COORDINATOR
  VOLUNTEER
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionToken])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// VOLUNTEER
// ============================================

model Volunteer {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status          String   @default("AVAILABLE")
  skills          String[]
  certifications  String[]
  availability    Json?
  emergencyContact Json?
  
  currentLat      Float?
  currentLng      Float?
  lastLocationUpdate DateTime?
  
  totalMissions   Int      @default(0)
  hoursVolunteered Float   @default(0)
  rating          Float?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  missions        Mission[]
  locationHistory VolunteerLocationHistory[]
  emergencyRequests EmergencyRequest[]

  @@index([status])
  @@index([userId])
}

model VolunteerLocationHistory {
  id         String   @id @default(cuid())
  volunteerId String
  volunteer  Volunteer @relation(fields: [volunteerId], references: [id], onDelete: Cascade)
  
  lat        Float
  lng        Float
  timestamp  DateTime @default(now())
  accuracy   Float?

  @@index([volunteerId])
  @@index([timestamp])
}

// ============================================
// DISASTER
// ============================================

model Disaster {
  id            String   @id @default(cuid())
  name          String
  disasterType  String
  severity      Int      @default(1)
  status        String   @default("ACTIVE")
  
  affectedArea  String?
  latitude      Float?
  longitude     Float?
  radius        Float?
  
  description   String?  @db.Text
  startDate     DateTime
  endDate       DateTime?
  estimatedAffected Int?
  
  resourcesAssigned Json?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  survivors     Survivor[]
  locations     Location[]
  distributions Distribution[]
  emergencyRequests EmergencyRequest[]
  inventories   Inventory[]

  @@index([status])
  @@index([disasterType])
  @@index([createdAt])
}

// ============================================
// SURVIVOR
// ============================================

model Survivor {
  id            String   @id @default(cuid())
  caseNumber    String   @unique
  firstName     String
  lastName      String
  dateOfBirth   DateTime?
  gender        String?
  
  phone         String?
  email         String?
  address       String?
  
  latitude      Float?
  longitude     Float?
  
  status        String   @default("REGISTERED")
  medicalNeeds  String[]
  medications   String[]
  allergies     String[]
  specialNeeds  String?
  
  familySize    Int      @default(1)
  dependents    Int      @default(0)
  familyMembers Json?
  
  disasterId    String?
  disaster      Disaster? @relation(fields: [disasterId], references: [id])
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])
  
  intakeNotes   String?  @db.Text
  intakeBy      String?
  intakeDate    DateTime @default(now())
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([caseNumber])
  @@index([status])
  @@index([disasterId])
}

// ============================================
// LOCATION
// ============================================

model Location {
  id                String   @id @default(cuid())
  name              String
  locationType      String
  operationalStatus String   @default("OPEN")
  
  address           String?
  city              String?
  state             String?
  zipCode           String?
  country           String   @default("USA")
  
  latitude          Float
  longitude         Float
  
  capacity          Int?
  currentOccupancy  Int      @default(0)
  
  phone             String?
  email             String?
  managerName       String?
  
  disasterId        String?
  disaster          Disaster? @relation(fields: [disasterId], references: [id])
  
  resources         Json?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  survivors         Survivor[]
  distributions     Distribution[]

  @@index([locationType])
  @@index([operationalStatus])
  @@index([disasterId])
}

// ============================================
// RESOURCE
// ============================================

model Resource {
  id            String   @id @default(cuid())
  name          String
  category      String
  subcategory   String?
  description   String?  @db.Text
  
  unitType      String   @default("each")
  unitWeight    Float?
  
  sku           String?  @unique
  barcode       String?
  
  storageTemp   String?
  hazardous     Boolean  @default(false)
  perishable    Boolean  @default(false)
  shelfLifeDays Int?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  distributions DistributionItem[]
  inventories   Inventory[]

  @@index([category])
  @@index([sku])
}

// ============================================
// DISTRIBUTION
// ============================================

model Distribution {
  id            String   @id @default(cuid())
  distributionType String
  
  quantity      Int
  quantityDistributed Int @default(0)
  
  disasterId    String?
  disaster      Disaster? @relation(fields: [disasterId], references: [id])
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])
  
  status        String   @default("PLANNED")
  
  scheduledDate DateTime?
  completedDate DateTime?
  
  notes         String?  @db.Text
  
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items         DistributionItem[]

  @@index([status])
  @@index([disasterId])
}

model DistributionItem {
  id             String     @id @default(cuid())
  distributionId String
  distribution   Distribution @relation(fields: [distributionId], references: [id], onDelete: Cascade)
  resourceId     String
  resource       Resource   @relation(fields: [resourceId], references: [id])
  
  quantity       Int
  quantityDistributed Int @default(0)

  @@unique([distributionId, resourceId])
}

// ============================================
// EMERGENCY REQUEST
// ============================================

model EmergencyRequest {
  id            String   @id @default(cuid())
  type          String
  priority      String   @default("P2")
  status        String   @default("PENDING")
  
  latitude      Float
  longitude     Float
  address       String?
  
  description   String   @db.Text
  details       Json?
  
  disasterId    String?
  disaster      Disaster? @relation(fields: [disasterId], references: [id])
  
  maxVolunteers Int      @default(5)
  
  reportedAt    DateTime @default(now())
  respondedAt   DateTime?
  resolvedAt    DateTime?
  deadline      DateTime?
  
  reportedBy    String?
  contactInfo   Json?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  assignedVolunteers Volunteer[]
  missions      Mission[]

  @@index([status])
  @@index([priority])
  @@index([createdAt])
}

// ============================================
// MISSION
// ============================================

model Mission {
  id              String   @id @default(cuid())
  emergencyRequestId String
  emergencyRequest EmergencyRequest @relation(fields: [emergencyRequestId], references: [id])
  
  volunteerId     String?
  volunteer       Volunteer? @relation(fields: [volunteerId], references: [id])
  
  status          String   @default("ASSIGNED")
  latitude        Float
  longitude       Float
  
  assignedAt      DateTime @default(now())
  arrivedAt       DateTime?
  completedAt     DateTime?
  
  notes           String?
  outcome         String?

  @@index([emergencyRequestId])
  @@index([volunteerId])
}

// ============================================
// INVENTORY
// ============================================

model Inventory {
  id            String   @id @default(cuid())
  disasterId    String?
  disaster      Disaster? @relation(fields: [disasterId], references: [id])
  
  resourceId    String
  resource      Resource @relation(fields: [resourceId], references: [id])
  
  quantity      Int
  quantityUsed  Int      @default(0)
  
  location      String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([disasterId])
  @@index([resourceId])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  
  action    String
  entity    String
  entityId  String?
  details   Json?
  
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// ============================================
// BREAK GLASS EVENT
// ============================================

model BreakGlassEvent {
  id        String   @id @default(cuid())
  userId    String
  reason    String   @db.Text
  grantedAt DateTime @default(now())
  expiresAt DateTime
  used      Boolean  @default(false)
  
  @@index([userId])
  @@index([expiresAt])
}
```

### 4.2 Database Setup Commands

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## 5. Phase 3: Vercel API Structure

### 5.1 API Base Configuration

**api/_lib/db.ts:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**api/_lib/auth.ts:**
```typescript
import { NextApiRequest } from 'next'
import { prisma } from './db'
import { verify } from 'jose'

export interface AuthUser {
  id: string
  email: string
  role: string
  fullName: string
}

export async function getUserFromToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await verify(token, secret)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      }
    })
    
    return user as AuthUser | null
  } catch {
    return null
  }
}

export async function requireAuth(req: NextApiRequest): Promise<AuthUser> {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
```

### 5.2 Example API Routes

**api/auth/me.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { getUserFromToken } from '../_lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = await getUserFromToken(token)
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Get full user data with preferences
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      language: true,
      fontSize: true,
      contrast: true,
      theme: true,
      image: true,
      breakGlassAccess: true,
      createdAt: true,
    }
  })
  
  res.json(fullUser)
}
```

**api/disasters/index.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'

const createDisasterSchema = z.object({
  name: z.string().min(1),
  disasterType: z.string(),
  severity: z.number().min(1).max(5),
  affectedArea: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { status, disasterType, limit = 100, orderBy = '-created_date' } = req.query
      
      const disasters = await prisma.disaster.findMany({
        where: {
          status: status as string,
          disasterType: disasterType as string,
        },
        orderBy: { createdAt: orderBy.startsWith('-') ? 'desc' : 'asc' },
        take: Number(limit),
      })
      
      return res.json(disasters)
    }
    
    if (req.method === 'POST') {
      const body = createDisasterSchema.parse(req.body)
      
      const disaster = await prisma.disaster.create({
        data: {
          ...body,
          startDate: new Date(body.startDate),
          status: 'ACTIVE',
        },
      })
      
      return res.status(201).json(disaster)
    }
    
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

**api/volunteers/index.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await requireAuth(req)
  
  if (req.method === 'GET') {
    const { status, limit = 100 } = req.query
    
    const volunteers = await prisma.volunteer.findMany({
      where: {
        status: status as string,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    })
    
    return res.json(volunteers)
  }
  
  if (req.method === 'POST') {
    const { userId, skills, certifications } = req.body
    
    const volunteer = await prisma.volunteer.create({
      data: {
        userId,
        skills: skills || [],
        certifications: certifications || [],
        status: 'AVAILABLE',
      },
      include: {
        user: true,
      },
    })
    
    return res.status(201).json(volunteer)
  }
  
  res.status(405).json({ error: 'Method not allowed' })
}
```

---

## 6. Phase 4: Authentication System

### 6.1 NextAuth Configuration

**api/auth/[...nextauth].ts:**
```typescript
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "../_lib/db"
import bcrypt from "bcryptjs"
import { sign } from "jose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials")
        }
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }
        
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
        
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 6.2 Custom Auth Context (Frontend)

**src/lib/AuthContext.jsx:**
```jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { apiClient } from '@/api/client'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true)
      const userData = await apiClient.get('/auth/me')
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      if (error.status === 401) {
        setAuthError({ type: 'auth_required' })
      }
      setIsAuthenticated(false)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password })
    localStorage.setItem('token', response.token)
    await checkAuth()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/auth/signin'
  }

  const updateUser = async (data) => {
    const updated = await apiClient.put('/auth/me', data)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      login,
      logout,
      updateUser,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 7. Phase 5: Frontend API Client

### 7.1 API Client Implementation

**src/api/client.ts:**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config
        
        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          localStorage.removeItem('token')
          window.location.href = '/auth/signin'
        }
        
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError) {
    return {
      status: error.response?.status,
      message: (error.response?.data as any)?.message || 'An error occurred',
      data: error.response?.data,
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url)
    return response.data
  }
}

export const apiClient = new ApiClient()
```

### 7.2 API Endpoints

**src/api/endpoints.ts:**
```typescript
export const endpoints = {
  // Auth
  authMe: '/auth/me',
  authLogin: '/auth/login',
  authLogout: '/auth/logout',
  authUpdate: '/auth/me',
  
  // Disasters
  disasters: '/disasters',
  disaster: (id: string) => `/disasters/${id}`,
  
  // Survivors
  survivors: '/survivors',
  survivor: (id: string) => `/survivors/${id}`,
  
  // Volunteers
  volunteers: '/volunteers',
  volunteer: (id: string) => `/volunteers/${id}`,
  volunteerStatusCheck: '/volunteers/status-check',
  
  // Locations
  locations: '/locations',
  
  // Resources
  resources: '/resources',
  
  // Distributions
  distributions: '/distributions',
  
  // Emergency Dispatch
  dispatchRequests: '/dispatch/requests',
  dispatchTrigger: '/dispatch/trigger',
  
  // Alerts
  disasterAlerts: '/alerts/disaster',
  
  // Stripe
  stripePayment: '/stripe/create-payment-intent',
}
```

### 7.3 Updated Query Hooks Example

**src/hooks/useDisasters.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useDisasters(filters?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['disasters', filters],
    queryFn: () => apiClient.get(endpoints.disasters, filters),
  })
}

export function useCreateDisaster() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post(endpoints.disasters, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] })
    },
  })
}

export function useUpdateDisaster() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(endpoints.disaster(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] })
    },
  })
}
```

---

## 8. Phase 6: Cloud Functions Migration

### 8.1 Disaster Alert Volunteers

**api/alerts/disaster.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await requireAuth(req)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { disasterId } = req.body
  
  // Get disaster
  const disaster = await prisma.disaster.findUnique({
    where: { id: disasterId }
  })
  
  if (!disaster) {
    return res.status(404).json({ error: 'Disaster not found' })
  }
  
  // Get available volunteers near the disaster
  const volunteers = await prisma.volunteer.findMany({
    where: {
      status: 'AVAILABLE',
      currentLat: { not: null },
      currentLng: { not: null },
    },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
          fullName: true,
        }
      }
    }
  })
  
  // TODO: Send notifications (email/SMS/push)
  // For now, just return the list
  res.json({
    disaster,
    alertedVolunteers: volunteers.length,
    volunteers,
  })
}
```

### 8.2 Trigger Emergency Dispatch

**api/dispatch/trigger.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'

const triggerSchema = z.object({
  type: z.string(),
  priority: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  description: z.string(),
  disasterId: z.string().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await requireAuth(req)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const body = triggerSchema.parse(req.body)
  
  // Create emergency request
  const request = await prisma.emergencyRequest.create({
    data: {
      ...body,
      status: 'PENDING',
    },
    include: {
      disaster: true,
    }
  })
  
  // Find and assign available volunteers
  const availableVolunteers = await prisma.volunteer.findMany({
    where: {
      status: { in: ['AVAILABLE', 'ON_DUTY'] },
    },
    take: 5,
  })
  
  // Create missions for assigned volunteers
  await prisma.mission.createMany({
    data: availableVolunteers.map(v => ({
      emergencyRequestId: request.id,
      volunteerId: v.id,
      latitude: body.latitude,
      longitude: body.longitude,
      status: 'ASSIGNED',
    }))
  })
  
  // Update volunteer status
  await prisma.volunteer.updateMany({
    where: {
      id: { in: availableVolunteers.map(v => v.id) }
    },
    data: { status: 'ON_DUTY' }
  })
  
  res.status(201).json({
    request,
    assignedVolunteers: availableVolunteers.length,
  })
}
```

### 8.3 Volunteer Status Check

**api/volunteers/status-check.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await requireAuth(req)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { volunteerId, status, location } = req.body
  
  // Update volunteer status
  const volunteer = await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      status,
      currentLat: location?.lat,
      currentLng: location?.lng,
      lastLocationUpdate: new Date(),
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        }
      }
    }
  })
  
  // Log location history
  if (location) {
    await prisma.volunteerLocationHistory.create({
      data: {
        volunteerId,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
      }
    })
  }
  
  res.json(volunteer)
}
```

---

## 9. Phase 7: Stripe Integration

### 9.1 Create Payment Intent

**api/stripe/create-payment-intent.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { requireAuth } from '../_lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await requireAuth(req)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { amount, currency = 'usd' } = req.body
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    res.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}
```

### 9.2 Stripe Webhook

**api/stripe/webhook.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { prisma } from '../_lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const buf = []
  for await (const chunk of req) {
    buf.push(chunk)
  }
  const body = Buffer.concat(buf).toString()
  
  const sig = req.headers['stripe-signature']!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      // Handle successful payment
      await prisma.distribution.updateMany({
        where: { /* match metadata */ },
        data: { status: 'COMPLETED' }
      })
      break
      
    case 'payment_intent.payment_failed':
      // Handle failed payment
      console.log('Payment failed:', event.data.object)
      break
      
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  res.json({ received: true })
}
```

---

## 10. Phase 8: Offline Support

### 10.1 Enhanced LocalStorage

**src/lib/offlineStorage.ts:**
```typescript
interface OfflineQueueItem {
  id: string
  endpoint: string
  method: string
  data: any
  timestamp: number
}

class OfflineStorage {
  private readonly QUEUE_KEY = 'aidbridge_offline_queue'
  private readonly CACHE_KEY = 'aidbridge_cache'
  
  addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) {
    const queue = this.getQueue()
    queue.push({
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    })
    this.saveQueue(queue)
  }
  
  getQueue(): OfflineQueueItem[] {
    const data = localStorage.getItem(this.QUEUE_KEY)
    return data ? JSON.parse(data) : []
  }
  
  saveQueue(queue: OfflineQueueItem[]) {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
  }
  
  removeFromQueue(id: string) {
    const queue = this.getQueue().filter(item => item.id !== id)
    this.saveQueue(queue)
  }
  
  cacheData(key: string, data: any, ttl: number = 3600000) {
    localStorage.setItem(this.CACHE_KEY + '_' + key, JSON.stringify({
      data,
      timestamp: Date.now(),
      ttl,
    }))
  }
  
  getCachedData<T>(key: string): T | null {
    const cached = localStorage.getItem(this.CACHE_KEY + '_' + key)
    if (!cached) return null
    
    const { data, timestamp, ttl } = JSON.parse(cached)
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(this.CACHE_KEY + '_' + key)
      return null
    }
    
    return data as T
  }
}

export const offlineStorage = new OfflineStorage()
```

### 10.2 Network Detection Hook

**src/hooks/useNetworkStatus.ts:**
```typescript
import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}
```

---

## 11. Phase 9: Deployment

### 11.1 Vercel Configuration

**vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "/api"
  },
  "functions": {
    "api/*.ts": {
      "runtime": "@vercel/node@3.0.0"
    }
  }
}
```

### 11.2 Deployment Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NEXTAUTH_SECRET
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### 11.3 Production Checklist

- [ ] Database migrated to Neon/Supabase
- [ ] All environment variables set in Vercel
- [ ] Stripe webhook URL configured
- [ ] CORS configured for production domain
- [ ] SSL certificates active
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] Backup strategy in place

---

## 12. Migration Checklist

### Phase 1: Setup
- [ ] Remove `@base44/sdk` and `@base44/vite-plugin` from package.json
- [ ] Remove `/functions` folder
- [ ] Remove `src/api/base44Client.js`
- [ ] Install new dependencies (Prisma, NextAuth, Stripe, etc.)
- [ ] Update `vite.config.js`
- [ ] Create `.env.local` with all required variables

### Phase 2: Database
- [ ] Create `prisma/schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create seed script (optional)
- [ ] Deploy migrations to production

### Phase 3: API Routes
- [ ] Create `api/_lib/db.ts`
- [ ] Create `api/_lib/auth.ts`
- [ ] Create auth endpoints (`/auth/me`, `/auth/login`, etc.)
- [ ] Create disaster endpoints
- [ ] Create survivor endpoints
- [ ] Create volunteer endpoints
- [ ] Create location endpoints
- [ ] Create resource endpoints
- [ ] Create distribution endpoints
- [ ] Create dispatch endpoints
- [ ] Create Stripe endpoints

### Phase 4: Frontend Auth
- [ ] Rewrite `src/lib/AuthContext.jsx`
- [ ] Update `src/Layout.jsx` auth calls
- [ ] Update all pages using `base44.auth.me()`

### Phase 5: API Client
- [ ] Create `src/api/client.ts`
- [ ] Create `src/api/endpoints.ts`
- [ ] Update all TanStack Query hooks
- [ ] Test all CRUD operations

### Phase 6: Cloud Functions
- [ ] Migrate `disasterAlertVolunteers` to API route
- [ ] Migrate `triggerEmergencyDispatch` to API route
- [ ] Migrate `volunteerStatusCheck` to API route

### Phase 7: Stripe
- [ ] Create payment intent endpoint
- [ ] Create webhook endpoint
- [ ] Update frontend Stripe integration
- [ ] Test payment flow

### Phase 8: Testing
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Test offline mode
- [ ] Test accessibility features
- [ ] Test responsive design
- [ ] Test Stripe payments
- [ ] Load testing

### Phase 9: Deployment
- [ ] Set up Neon database
- [ ] Configure Vercel project
- [ ] Set all environment variables
- [ ] Deploy to staging
- [ ] Test staging environment
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Migration
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Update documentation
- [ ] Train team on new system
- [ ] Plan rollback strategy (if needed)

---

## Security Considerations

1. **Rate Limiting:** Implement with `@vercel/kv` or `express-rate-limit`
2. **CSRF Protection:** Use CSRF tokens for state-changing operations
3. **Input Validation:** All inputs validated with Zod
4. **SQL Injection:** Prevented by Prisma ORM
5. **XSS Protection:** React escapes by default, use DOMPurify for rich text
6. **Secure Cookies:** httpOnly, secure, sameSite flags
7. **CORS:** Configure allowed origins in production

---

## Support & Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org/
- **Vercel Docs:** https://vercel.com/docs
- **Neon Database:** https://neon.tech/docs
- **Stripe Docs:** https://stripe.com/docs

---

## 13. Phase 10: Public Victim Portal

### Overview

Add a **Public Victim Portal** allowing disaster survivors to directly request help without admin credentials. This extends AidBridge with self-service capabilities for victims while maintaining staff dashboard security.

### Business Value

**Problems Solved:**
- ❌ Victims must call/email admin for help
- ❌ Admin bottleneck - single point of failure
- ❌ Delayed emergency response
- ❌ No self-service options

**Benefits:**
- ✅ Direct help requests - instant submission
- ✅ Reduced admin load - automated intake
- ✅ Faster response - real-time dispatch
- ✅ Transparency - victims track requests
- ✅ Scalability - handle many victims simultaneously

---

### 13.1 New User Role

```prisma
enum Role {
  ADMIN          // Full system access
  COORDINATOR    // Operations management
  VOLUNTEER      // Field operations
  SURVIVOR       // NEW: View own data only
}
```

**Survivor Role Permissions:**
- ✅ View own profile
- ✅ View own help requests
- ✅ View own survivor record
- ✅ Update contact information
- ❌ View other survivors (privacy)
- ❌ View staff data
- ❌ Access dashboard

---

### 13.2 Public Routes (No Login Required)

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/help` | Public landing page | ❌ No |
| `/help/request` | Emergency help request form | ❌ No |
| `/register` | Survivor self-registration | ❌ No |
| `/track` | Track request status | ❌ No |
| `/track/:id` | Specific request details | ❌ No |
| `/login` | Staff login | ❌ No |

**Protected Routes (Login Required):**
- All existing staff routes remain protected
- Survivors access separate portal at `/survivor/portal`

---

### 13.3 Database Schema Updates

#### New Table: PublicHelpRequest

```prisma
model PublicHelpRequest {
  id              String   @id @default(cuid())
  requestId       String   @unique  // REQ-YYYYMMDD-XXX
  fullName        String
  phone           String
  email           String?
  location        String
  latitude        Float?
  longitude       Float?
  emergencyType   String   // MEDICAL, RESCUE, SHELTER, FOOD, OTHER
  priority        String   // P0, P1, P2, P3
  description     String   @db.Text
  peopleCount     Int      @default(1)
  status          String   @default("PENDING")
  assignedTo      String?  // Volunteer ID
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  disaster        Disaster? @relation(fields: [disasterId], references: [id])
  disasterId      String?

  @@index([requestId])
  @@index([status])
  @@index([createdAt])
}
```

#### New Table: SurvivorRegistration

```prisma
model SurvivorRegistration {
  id              String   @id @default(cuid())
  caseNumber      String   @unique  // SRV-YYYYMMDD-XXX

  // Personal info
  firstName       String
  lastName        String
  phone           String
  email           String?
  dateOfBirth     DateTime?
  householdSize   Int      @default(1)

  // Consent
  consentDataSharing Boolean @default(false)
  consentContact     Boolean @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([caseNumber])
}
```

#### Update User Model

```prisma
model User {
  // ... existing fields ...
  role            Role     @default(VOLUNTEER)

  // For survivor accounts (future use)
  isSurvivor      Boolean  @default(false)
  survivorProfile Survivor?
}
```

---

### 13.4 API Endpoints

#### Public Endpoints (No Auth)

```javascript
// Emergency Help Request
POST /api/public/help
Body: {
  fullName: string,
  phone: string,
  location: string,
  latitude?: number,
  longitude?: number,
  emergencyType: 'MEDICAL' | 'RESCUE' | 'SHELTER' | 'FOOD' | 'OTHER',
  priority: 'P0' | 'P1' | 'P2' | 'P3',
  description: string,
  peopleCount: number
}
Response: {
  requestId: 'REQ-20260303-001',
  status: 'PENDING',
  message: 'Help request submitted. Track status with Request ID.'
}

// Survivor Registration
POST /api/public/survivor/register
Body: {
  firstName: string,
  lastName: string,
  phone: string,
  email?: string,
  dateOfBirth?: string,
  householdSize: number,
  householdMembers?: [],
  medicalNeeds?: [],
  shelterRequired: boolean,
  consentDataSharing: boolean,
  consentContact: boolean
}
Response: {
  caseNumber: 'SRV-20260303-1001',
  status: 'PENDING',
  message: 'Registration submitted. Save your Case Number to track status.'
}

// Track Request Status
GET /api/public/track/:requestId
Response: {
  requestId: 'REQ-20260303-001',
  status: 'IN_PROGRESS',
  createdAt: '2026-03-03T10:00:00Z',
  emergencyType: 'MEDICAL',
  assignedVolunteer?: { name: 'John', phone: '555-0100' },
  estimatedArrival?: '15 minutes',
  timeline: [
    { status: 'PENDING', timestamp: '2026-03-03T10:00:00Z' },
    { status: 'ASSIGNED', timestamp: '2026-03-03T10:15:00Z' },
    { status: 'IN_PROGRESS', timestamp: '2026-03-03T10:20:00Z' }
  ]
}
```

#### Protected Endpoints (Staff)

```javascript
// View all public help requests
GET /api/dispatch/requests
Query: status?, priority?, disasterId?

// Assign volunteer to help request
PUT /api/dispatch/requests/:id/assign
Body: { volunteerId: string }

// View pending survivor registrations
GET /api/survivors/pending-registrations

// Verify survivor registration
PUT /api/survivors/verify/:caseNumber
Body: { verified: boolean, notes?: string }
```

---

### 13.5 Security Measures

#### Rate Limiting

```javascript
const rateLimitConfig = {
  helpRequest: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per window
    message: 'Too many requests, please try again later'
  },
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // 2 registrations per hour
  },
  tracking: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 lookups per 15 min
  }
}
```

#### CAPTCHA Integration

```javascript
// hCaptcha or reCAPTCHA for spam prevention
const captchaConfig = {
  enabled: true,
  provider: 'hcaptcha',
  siteKey: process.env.HCAPTCHA_SITE_KEY,
  secretKey: process.env.HCAPTCHA_SECRET_KEY,
  threshold: 0.5
}
```

#### Data Isolation

```javascript
// Survivors can ONLY view their own data
const survivorDataPolicy = {
  canView: ['own_profile', 'own_requests', 'own_case_status'],
  cannotView: ['other_survivors', 'volunteer_list', 'disaster_details', 'staff_data'],
  cannotModify: ['status', 'assigned_volunteer', 'case_number', 'priority']
}
```

---

### 13.6 Implementation Steps

#### Step 1: Core Features (Days 1-2)

**Files to Create:**
```
src/pages/public/
├── HelpLanding.jsx          // /help - Public landing page
├── HelpRequestForm.jsx      // /help/request - Emergency form
├── SurvivorRegister.jsx     // /register - Registration form
└── TrackRequest.jsx         // /track - Status tracking

src/api/public/
├── help.ts                  // POST /api/public/help
├── register.ts              // POST /api/public/survivor/register
└── track.ts                 // GET /api/public/track/:id
```

**Tasks:**
- [ ] Add SURVIVOR role to `src/lib/AuthContext.jsx`
- [ ] Create `PublicHelpRequest` database model
- [ ] Create `SurvivorRegistration` database model
- [ ] Run `npx prisma migrate dev --name add_survivor_portal`
- [ ] Create public API endpoints
- [ ] Build landing page (/help)
- [ ] Build emergency help request form
- [ ] Build survivor registration form
- [ ] Build status tracking page
- [ ] Add rate limiting middleware
- [ ] Add CAPTCHA integration

#### Step 2: Integration (Day 3)

**Files to Update:**
```
src/pages/EmergencyDispatch.jsx  // Show public help requests
src/components/dispatch/         // Add public request cards
src/lib/mockData.js              // Add survivor mock data
```

**Tasks:**
- [ ] Connect help requests to Emergency Dispatch dashboard
- [ ] Add notifications for new public requests
- [ ] Build staff view for pending survivor registrations
- [ ] Add volunteer assignment to help requests
- [ ] Update dispatch KPIs to include public requests
- [ ] Test end-to-end flow (request → dispatch → resolve)

#### Step 3: Security & Polish (Day 4)

**Tasks:**
- [ ] Implement rate limiting on all public endpoints
- [ ] Add CAPTCHA to forms
- [ ] Mobile responsive testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Privacy compliance review

---

### 13.7 UI/UX Specifications

#### Landing Page (/help)

**Components:**
- Hero section with emergency contact info
- 3 action buttons:
  - 🚨 Request Emergency Help (red, prominent)
  - 📝 Register as Survivor (blue)
  - 🔍 Track My Request (green)
- Staff login link (discreet, bottom)
- Multi-language selector
- Accessibility options (font size, contrast)

#### Emergency Help Form

**Steps:**
1. **Contact Info** (1 min)
   - Full Name
   - Phone Number
   - Current Location (GPS button + manual entry)

2. **Emergency Details** (1 min)
   - Type: Medical, Rescue, Shelter, Food, Other
   - Priority: Auto-detected or manual
   - Description
   - Number of people

3. **Review & Submit** (30 sec)
   - Summary
   - CAPTCHA
   - Submit button

**Success:**
- Show Request ID: `REQ-20260303-001`
- SMS confirmation (optional)
- Track button

#### Status Tracking Page

**Input:**
- Request ID or Case Number field
- Phone number for verification

**Display:**
- Current status badge (color-coded)
- Timeline with timestamps
- Assigned volunteer info (if assigned)
- Contact options
- Update request button

---

### 13.8 Testing Checklist

#### Functional Tests
- [ ] Submit help request → Get Request ID
- [ ] Track request with ID → See status
- [ ] Register as survivor → Get Case Number
- [ ] OTP login → Access survivor portal
- [ ] Staff sees public requests in dispatch
- [ ] Assign volunteer to public request
- [ ] Update request status → Survivor sees update

#### Security Tests
- [ ] Rate limiting blocks spam
- [ ] CAPTCHA prevents bots
- [ ] Survivor can't view other survivors
- [ ] Public routes don't expose staff data
- [ ] Phone verification required for tracking

#### Performance Tests
- [ ] Page loads in < 3 seconds on 3G
- [ ] Form submission < 2 seconds
- [ ] Supports 1000 concurrent users
- [ ] Low-bandwidth mode works
- [ ] Mobile responsive on all devices

#### Accessibility Tests
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Font scaling works
- [ ] Error messages clear and helpful

---

### 13.9 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Help request submission time | < 3 minutes | Form analytics |
| Registration completion rate | > 70% | Funnel analysis |
| Time to volunteer assignment | < 15 minutes | Dispatch metrics |
| User satisfaction | > 4/5 stars | Post-resolution survey |
| System uptime | > 99.9% | Monitoring |
| Mobile page load | < 3 seconds | Lighthouse |
| Spam reduction | > 90% | Rate limiting logs |

---

### 13.10 Rollout Plan

#### Phase 1: Internal Testing (Week 1)
- Team testing only
- Staging environment
- Fix critical bugs

#### Phase 2: Beta Launch (Week 2)
- Limited geographic area
- Monitor closely
- Gather feedback

#### Phase 3: Full Launch (Week 3)
- All regions
- Marketing announcement
- 24/7 support ready

#### Phase 4: Optimization (Week 4+)
- Analyze usage data
- A/B test improvements
- Add requested features

---

### 13.11 Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Spam/fake requests | High | Rate limiting, CAPTCHA, phone verification |
| Privacy breach | Critical | Data isolation, encryption, audit logs |
| System overload | High | Auto-scaling, queue management |
| Language barriers | Medium | Multi-language support |
| Low connectivity | Medium | Low-bandwidth mode, SMS fallback |
| Medical liability | High | Clear disclaimers, P0 routing to 911 |

---

### 13.12 Optional Enhancements (Future)

**Panic Button:**
- Hold-for-3-seconds button
- Immediately alerts all nearby volunteers
- Sends P0 emergency to dispatch

**Multi-Language:**
- Auto-detect from browser
- Support: EN, ES, ZH, BN, FR, AR

**Low-Bandwidth Mode:**
- Detect 2G/slow connections
- Disable images, animations
- Text-only mode

**SMS Notifications (Future):**
- Send confirmation SMS with Request ID
- Status update notifications

---

## 14. Updated Migration Checklist

### Phase 10: Public Victim Portal
- [ ] Add SURVIVOR role to AuthContext
- [ ] Create PublicHelpRequest database model
- [ ] Create SurvivorRegistration database model
- [ ] Run database migrations
- [ ] Create public API endpoints
- [ ] Build public landing page (/help)
- [ ] Build emergency help request form
- [ ] Build survivor registration form
- [ ] Build status tracking page
- [ ] Add rate limiting
- [ ] Add CAPTCHA integration
- [ ] Connect to Emergency Dispatch
- [ ] Build staff view for pending registrations
- [ ] Add volunteer assignment flow
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Security testing
- [ ] Load testing
- [ ] Privacy compliance review
- [ ] Internal testing
- [ ] Beta launch
- [ ] Full launch

---

*Generated: March 3, 2026*
*Last Updated: March 3, 2026 (Added Phase 10: Public Victim Portal)*

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VOLUNTEER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "fontSize" TEXT NOT NULL DEFAULT 'MEDIUM',
    "contrast" TEXT NOT NULL DEFAULT 'STANDARD',
    "theme" TEXT NOT NULL DEFAULT 'DARK',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "breakGlassAccess" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicHelpRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "emergencyType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "description" TEXT NOT NULL,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disasterId" TEXT,

    CONSTRAINT "PublicHelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurvivorRegistration" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "consentDataSharing" BOOLEAN NOT NULL DEFAULT false,
    "consentContact" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurvivorRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "skills" TEXT[],
    "certifications" TEXT[],
    "availability" JSONB,
    "emergencyContact" JSONB,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "lastLocationUpdate" TIMESTAMP(3),
    "totalMissions" INTEGER NOT NULL DEFAULT 0,
    "hoursVolunteered" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerLocationHistory" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accuracy" DOUBLE PRECISION,

    CONSTRAINT "VolunteerLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disasterType" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "affectedArea" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "estimatedAffected" INTEGER,
    "resourcesAssigned" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survivor" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "medicalNeeds" TEXT[],
    "medications" TEXT[],
    "allergies" TEXT[],
    "specialNeeds" TEXT,
    "familySize" INTEGER NOT NULL DEFAULT 1,
    "dependents" INTEGER NOT NULL DEFAULT 0,
    "familyMembers" JSONB,
    "disasterId" TEXT,
    "locationId" TEXT,
    "intakeNotes" TEXT,
    "intakeBy" TEXT,
    "intakeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survivor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "operationalStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT,
    "managerName" TEXT,
    "disasterId" TEXT,
    "resources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "unitType" TEXT NOT NULL DEFAULT 'each',
    "unitWeight" DOUBLE PRECISION,
    "sku" TEXT,
    "barcode" TEXT,
    "storageTemp" TEXT,
    "hazardous" BOOLEAN NOT NULL DEFAULT false,
    "perishable" BOOLEAN NOT NULL DEFAULT false,
    "shelfLifeDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "distributionType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityDistributed" INTEGER NOT NULL DEFAULT 0,
    "disasterId" TEXT,
    "locationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionItem" (
    "id" TEXT NOT NULL,
    "distributionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityDistributed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DistributionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "disasterId" TEXT,
    "maxVolunteers" INTEGER NOT NULL DEFAULT 5,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "reportedBy" TEXT,
    "contactInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "emergencyRequestId" TEXT NOT NULL,
    "volunteerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "outcome" TEXT,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "disasterId" TEXT,
    "resourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityUsed" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakGlassEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BreakGlassEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssignedVolunteers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedVolunteers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "PublicHelpRequest_requestId_key" ON "PublicHelpRequest"("requestId");

-- CreateIndex
CREATE INDEX "PublicHelpRequest_requestId_idx" ON "PublicHelpRequest"("requestId");

-- CreateIndex
CREATE INDEX "PublicHelpRequest_status_idx" ON "PublicHelpRequest"("status");

-- CreateIndex
CREATE INDEX "PublicHelpRequest_createdAt_idx" ON "PublicHelpRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurvivorRegistration_caseNumber_key" ON "SurvivorRegistration"("caseNumber");

-- CreateIndex
CREATE INDEX "SurvivorRegistration_caseNumber_idx" ON "SurvivorRegistration"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_userId_key" ON "Volunteer"("userId");

-- CreateIndex
CREATE INDEX "Volunteer_status_idx" ON "Volunteer"("status");

-- CreateIndex
CREATE INDEX "Volunteer_userId_idx" ON "Volunteer"("userId");

-- CreateIndex
CREATE INDEX "VolunteerLocationHistory_volunteerId_idx" ON "VolunteerLocationHistory"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerLocationHistory_timestamp_idx" ON "VolunteerLocationHistory"("timestamp");

-- CreateIndex
CREATE INDEX "Disaster_status_idx" ON "Disaster"("status");

-- CreateIndex
CREATE INDEX "Disaster_disasterType_idx" ON "Disaster"("disasterType");

-- CreateIndex
CREATE INDEX "Disaster_createdAt_idx" ON "Disaster"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Survivor_caseNumber_key" ON "Survivor"("caseNumber");

-- CreateIndex
CREATE INDEX "Survivor_caseNumber_idx" ON "Survivor"("caseNumber");

-- CreateIndex
CREATE INDEX "Survivor_status_idx" ON "Survivor"("status");

-- CreateIndex
CREATE INDEX "Survivor_disasterId_idx" ON "Survivor"("disasterId");

-- CreateIndex
CREATE INDEX "Location_locationType_idx" ON "Location"("locationType");

-- CreateIndex
CREATE INDEX "Location_operationalStatus_idx" ON "Location"("operationalStatus");

-- CreateIndex
CREATE INDEX "Location_disasterId_idx" ON "Location"("disasterId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_sku_key" ON "Resource"("sku");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_sku_idx" ON "Resource"("sku");

-- CreateIndex
CREATE INDEX "Distribution_status_idx" ON "Distribution"("status");

-- CreateIndex
CREATE INDEX "Distribution_disasterId_idx" ON "Distribution"("disasterId");

-- CreateIndex
CREATE UNIQUE INDEX "DistributionItem_distributionId_resourceId_key" ON "DistributionItem"("distributionId", "resourceId");

-- CreateIndex
CREATE INDEX "EmergencyRequest_status_idx" ON "EmergencyRequest"("status");

-- CreateIndex
CREATE INDEX "EmergencyRequest_priority_idx" ON "EmergencyRequest"("priority");

-- CreateIndex
CREATE INDEX "EmergencyRequest_createdAt_idx" ON "EmergencyRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Mission_emergencyRequestId_idx" ON "Mission"("emergencyRequestId");

-- CreateIndex
CREATE INDEX "Mission_volunteerId_idx" ON "Mission"("volunteerId");

-- CreateIndex
CREATE INDEX "Inventory_disasterId_idx" ON "Inventory"("disasterId");

-- CreateIndex
CREATE INDEX "Inventory_resourceId_idx" ON "Inventory"("resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "BreakGlassEvent_userId_idx" ON "BreakGlassEvent"("userId");

-- CreateIndex
CREATE INDEX "BreakGlassEvent_expiresAt_idx" ON "BreakGlassEvent"("expiresAt");

-- CreateIndex
CREATE INDEX "_AssignedVolunteers_B_index" ON "_AssignedVolunteers"("B");

-- AddForeignKey
ALTER TABLE "PublicHelpRequest" ADD CONSTRAINT "PublicHelpRequest_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerLocationHistory" ADD CONSTRAINT "VolunteerLocationHistory_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survivor" ADD CONSTRAINT "Survivor_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survivor" ADD CONSTRAINT "Survivor_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionItem" ADD CONSTRAINT "DistributionItem_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "Distribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionItem" ADD CONSTRAINT "DistributionItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_emergencyRequestId_fkey" FOREIGN KEY ("emergencyRequestId") REFERENCES "EmergencyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "Disaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedVolunteers" ADD CONSTRAINT "_AssignedVolunteers_A_fkey" FOREIGN KEY ("A") REFERENCES "EmergencyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedVolunteers" ADD CONSTRAINT "_AssignedVolunteers_B_fkey" FOREIGN KEY ("B") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

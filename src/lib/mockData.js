// Mock data for testing without backend

// Different user roles for testing
export const mockUsers = {
  ADMIN: {
    id: "user_1",
    email: "admin@aidbridge.org",
    password: "password", // In production, this would be hashed
    fullName: "Admin User",
    phone: "+1-555-0100",
    role: "ADMIN",
    language: "en",
    fontSize: "medium",
    contrast: "standard",
    theme: "dark",
    breakGlassAccess: true,
    createdAt: new Date().toISOString(),
  },
  COORDINATOR: {
    id: "user_2",
    email: "coordinator@aidbridge.org",
    password: "password",
    fullName: "Sarah Coordinator",
    phone: "+1-555-0101",
    role: "COORDINATOR",
    language: "en",
    fontSize: "medium",
    contrast: "standard",
    theme: "dark",
    breakGlassAccess: false,
    createdAt: new Date().toISOString(),
  },
  VOLUNTEER: {
    id: "user_3",
    email: "volunteer@aidbridge.org",
    password: "password",
    fullName: "John Volunteer",
    phone: "+1-555-0102",
    role: "VOLUNTEER",
    language: "en",
    fontSize: "medium",
    contrast: "standard",
    theme: "dark",
    breakGlassAccess: false,
    createdAt: new Date().toISOString(),
  },
};

// Default to admin for backward compatibility
export const mockUser = mockUsers.ADMIN;

export const mockDisasters = [
  {
    id: "disaster_1",
    name: "Hurricane Milton",
    disasterType: "hurricane",
    severity: 4,
    status: "ACTIVE",
    affectedArea: "Florida Gulf Coast",
    description: "Category 4 hurricane approaching Florida",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "disaster_2",
    name: "California Wildfires",
    disasterType: "wildfire",
    severity: 5,
    status: "ACTIVE",
    affectedArea: "Southern California",
    description: "Multiple wildfires across Southern California",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "disaster_3",
    name: "Texas Flooding",
    disasterType: "flood",
    severity: 3,
    status: "MONITORING",
    affectedArea: "Houston Metro Area",
    description: "Severe flooding from tropical storm",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export const mockVolunteers = [
  {
    id: "vol_1",
    userId: "user_4",
    status: "AVAILABLE",
    skills: ["Medical", "First Aid"],
    certifications: ["EMT", "CPR"],
    user: {
      fullName: "John Smith",
      email: "john@example.com",
      phone: "+1-555-0201",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "vol_2",
    userId: "user_5",
    status: "ON_DUTY",
    skills: ["Logistics", "Driving"],
    certifications: ["CDL"],
    user: {
      fullName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0202",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "vol_3",
    userId: "user_6",
    status: "AVAILABLE",
    skills: ["Translation", "Counseling"],
    certifications: [],
    user: {
      fullName: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1-555-0203",
    },
    createdAt: new Date().toISOString(),
  },
];

export const mockSurvivors = [
  {
    id: "surv_1",
    caseNumber: "SRV-20260303-1001",
    firstName: "Robert",
    lastName: "Williams",
    phone: "+1-555-0301",
    email: "robert@example.com",
    status: "REGISTERED",
    householdSize: 4,
    disasterId: "disaster_1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "surv_2",
    caseNumber: "SRV-20260303-1002",
    firstName: "Emily",
    lastName: "Brown",
    phone: "+1-555-0302",
    status: "SAFE",
    householdSize: 2,
    disasterId: "disaster_1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "surv_3",
    caseNumber: "SRV-20260303-1003",
    firstName: "Michael",
    lastName: "Davis",
    phone: "+1-555-0303",
    status: "INJURED",
    householdSize: 1,
    medicalNeeds: ["Diabetes"],
    disasterId: "disaster_2",
    createdAt: new Date().toISOString(),
  },
];

export const mockLocations = [
  {
    id: "loc_1",
    name: "Central High School Shelter",
    locationType: "SHELTER",
    operationalStatus: "OPEN",
    address: "123 Main St, Tampa, FL",
    capacity: 500,
    currentOccupancy: 342,
    contactPhone: "+1-555-0401",
    managerName: "Principal Johnson",
    createdAt: new Date().toISOString(),
  },
  {
    id: "loc_2",
    name: "Community Center",
    locationType: "DISTRIBUTION_CENTER",
    operationalStatus: "OPEN",
    address: "456 Oak Ave, Tampa, FL",
    capacity: 200,
    currentOccupancy: 85,
    createdAt: new Date().toISOString(),
  },
];

export const mockResources = [
  { id: "res_1", name: "Emergency Blankets", category: "SHELTER", unitType: "each", parLevel: 100 },
  { id: "res_2", name: "Bottled Water (1L)", category: "WATER", unitType: "case", parLevel: 500 },
  { id: "res_3", name: "MRE Packs", category: "FOOD", unitType: "case", parLevel: 200 },
  { id: "res_4", name: "First Aid Kits", category: "MEDICAL", unitType: "each", parLevel: 50 },
];

export const mockDistributions = [
  {
    id: "dist_1",
    distributionType: "INDIVIDUAL",
    quantity: 50,
    status: "COMPLETED",
    disasterId: "disaster_1",
    locationId: "loc_2",
    resource: { name: "MRE Packs" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "dist_2",
    distributionType: "BULK",
    quantity: 200,
    status: "IN_PROGRESS",
    disasterId: "disaster_1",
    resource: { name: "Bottled Water (1L)" },
    createdAt: new Date().toISOString(),
  },
];

export const mockEmergencyRequests = [
  {
    id: "req_1",
    type: "MEDICAL_EMERGENCY",
    priority: "P0",
    status: "PENDING",
    description: "Elderly person needs evacuation",
    address: "789 Flood Zone, Tampa",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "req_2",
    type: "RESCUE",
    priority: "P1",
    status: "IN_PROGRESS",
    description: "Family trapped on roof",
    address: "321 Water St, Tampa",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const mockBreakGlassEvents = [
  {
    id: "bg_1",
    userId: "user_1",
    reason: "Emergency access needed for critical patient data",
    grantedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    used: true,
  },
];

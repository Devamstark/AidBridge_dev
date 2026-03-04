# AidBridge Migration Guide - Complete

## Quick Reference: Replacing Base44 SDK

### Import Replacements

**Before (Base44):**
```javascript
import { base44 } from "@/api/base44Client";
```

**After (New API):**
```javascript
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
// OR use hooks:
import { useDisasters } from "@/hooks/useDisasters";
import { useAuth } from "@/lib/AuthContext";
```

---

## Method Replacements

### Authentication

| Old (Base44) | New (AuthContext) |
|--------------|-------------------|
| `base44.auth.me()` | `useAuth().user` |
| `base44.auth.logout()` | `useAuth().logout()` |
| `base44.auth.updateMe(data)` | `apiClient.put('/auth/update', data)` |

### Entity Operations

| Old (Base44) | New (API Client) |
|--------------|------------------|
| `base44.entities.X.list(order, limit)` | `apiClient.get(endpoints.xs, { limit })` |
| `base44.entities.X.create(data)` | `apiClient.post(endpoints.xs, data)` |
| `base44.entities.X.update(id, data)` | `apiClient.put(endpoints.x(id), data)` |
| `base44.entities.X.filter(query)` | `apiClient.get(endpoints.xs, query)` |
| `base44.entities.X.subscribe(cb)` | ❌ Not available (use polling) |

---

## Property Name Changes

| Old (Base44/snake_case) | New (Prisma/camelCase) |
|-------------------------|------------------------|
| `full_name` | `fullName` |
| `created_date` | `createdAt` |
| `updated_date` | `updatedAt` |
| `disaster_type` | `disasterType` |
| `operational_status` | `operationalStatus` |
| `distribution_type` | `distributionType` |
| `case_number` | `caseNumber` |
| `first_name` | `firstName` |
| `last_name` | `lastName` |
| `household_size` | `householdSize` |
| `created_by` | `createdBy` |
| `assigned_disaster_id` | `disasterId` |

---

## React Query Hook Patterns

### List Data
```javascript
// Before
const { data: disasters = [] } = useQuery({
  queryKey: ["disasters"],
  queryFn: () => base44.entities.Disaster.list("-created_date", 100),
});

// After (using hook)
const { data: disasters = [] } = useDisasters({ limit: 100 });

// After (using apiClient)
const { data: disasters = [] } = useQuery({
  queryKey: ["disasters"],
  queryFn: () => apiClient.get(endpoints.disasters, { limit: 100 }),
});
```

### Create Mutation
```javascript
// Before
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Disaster.create(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disasters"] }),
});

// After
const createMutation = useMutation({
  mutationFn: (data) => apiClient.post(endpoints.disasters, data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disasters"] }),
});
```

### Update Mutation
```javascript
// Before
const updateMutation = useMutation({
  mutationFn: ({ id }) => base44.entities.Disaster.update(id, { status: "closed" }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disasters"] }),
});

// After
const updateMutation = useMutation({
  mutationFn: ({ id }) => apiClient.put(endpoints.disaster(id), { status: "CLOSED" }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disasters"] }),
});
```

---

## File-by-File Migration Checklist

### ✅ Already Migrated
- [x] src/pages/Dashboard.jsx
- [x] src/Layout.jsx
- [x] src/lib/AuthContext.jsx

### ⏳ Pages to Migrate

#### 1. Disasters.jsx
```javascript
// Replace imports
-import { base44 } from "@/api/base44Client";
+import { useDisasters } from "@/hooks/useDisasters";
+import { apiClient } from "@/api/client";

// Replace query
-const { data: disasters = [], isLoading } = useQuery({
-  queryKey: ["disasters"],
-  queryFn: () => base44.entities.Disaster.list("-created_date", 100),
-});
+const { data: disasters = [], isLoading } = useDisasters({ limit: 100 });

// Replace create mutation
-const createMutation = useMutation({
-  mutationFn: (data) => base44.entities.Disaster.create(data),
-});
+const createMutation = useMutation({
+  mutationFn: (data) => apiClient.post(endpoints.disasters, data),
+});

// Replace update mutations (status changes)
-const endDisasterMutation = useMutation({
-  mutationFn: ({ id }) => base44.entities.Disaster.update(id, { status: "closed" }),
-});
+const endDisasterMutation = useMutation({
+  mutationFn: ({ id }) => apiClient.put(endpoints.disaster(id), { status: "RESOLVED" }),
+});

// Property changes in component:
// d.created_date → d.createdAt
// d.disaster_type → d.disasterType
```

#### 2. Survivors.jsx
```javascript
// Replace imports
-import { base44 } from "@/api/base44Client";
+import { useSurvivors } from "@/hooks/useSurvivors";
+import { apiClient } from "@/api/client";
+import { useAuth } from "@/lib/AuthContext";

// Replace auth check
-useEffect(() => {
-  base44.auth.me().then(setCurrentUser).catch(() => {});
-}, []);
+const { user: currentUser } = useAuth();

// Replace query
-const { data: survivors = [], isLoading } = useQuery({
-  queryKey: ["survivors"],
-  queryFn: () => base44.entities.Survivor.list("-created_date", 200),
-});
+const { data: survivors = [], isLoading } = useSurvivors({ limit: 200 });

// Property changes:
// s.first_name → s.firstName
// s.last_name → s.lastName
// s.case_number → s.caseNumber
// s.household_size → s.householdSize
// s.created_date → s.createdAt
// s.disaster_id → s.disasterId
// s.location_id → s.locationId
```

#### 3. Locations.jsx
```javascript
// Replace imports
-import { base44 } from "@/api/base44Client";
+import { useLocations } from "@/hooks/useLocations";
+import { apiClient } from "@/api/client";

// Replace queries
-const { data: locations = [], isLoading } = useQuery({
-  queryKey: ["locations"],
-  queryFn: () => base44.entities.Location.list("-created_date", 100),
-});
+const { data: locations = [], isLoading } = useLocations({ limit: 100 });

-const { data: disasters = [] } = useQuery({
-  queryKey: ["disasters"],
-  queryFn: () => base44.entities.Disaster.filter({ status: "active" }),
-});
+const { data: disasters = [] } = useDisasters({ status: "ACTIVE" });

// Replace create mutation
-const createMutation = useMutation({
-  mutationFn: (data) => base44.entities.Location.create(data),
-});
+const createMutation = useMutation({
+  mutationFn: (data) => apiClient.post(endpoints.locations, data),
+});

// Property changes:
// l.location_type → l.locationType
// l.operational_status → l.operationalStatus
// l.current_occupancy → l.currentOccupancy
// l.contact_phone → l.contactPhone
// l.manager_name → l.managerName
// l.disaster_id → l.disasterId
```

#### 4. Resources.jsx
```javascript
// Replace imports
-import { base44 } from "@/api/base44Client";
+import { useResources } from "@/hooks/useResources";
+import { apiClient } from "@/api/client";

// Replace query
-const { data: resources = [], isLoading } = useQuery({
-  queryKey: ["resources"],
-  queryFn: () => base44.entities.Resource.list("-created_date", 200),
-});
+const { data: resources = [], isLoading } = useResources({ limit: 200 });

// Replace create mutation
-const createMutation = useMutation({
-  mutationFn: (data) => base44.entities.Resource.create(data),
-});
+const createMutation = useMutation({
+  mutationFn: (data) => apiClient.post(endpoints.resources, data),
+});

// Property changes:
// r.resource_type → r.subcategory (or keep as is if custom field)
// r.category → r.category (same)
// r.par_level → parLevel (add to schema if needed)
```

#### 5. Distributions.jsx
```javascript
// Replace queries
-const { data: distributions = [], isLoading } = useQuery({
-  queryKey: ["distributions"],
-  queryFn: () => base44.entities.Distribution.list("-created_date", 200),
-});
+const { data: distributions = [], isLoading } = useDistributions({ limit: 200 });

// Property changes:
// d.resource_name → d.resourceName (or from resource relation)
// d.distribution_type → d.distributionType
// d.from_location_id → d.locationId
// d.disaster_id → d.disasterId
// d.created_date → d.createdAt
```

#### 6. EmergencyDispatch.jsx
```javascript
// Replace imports
-import { base44 } from "@/api/base44Client";
+import { useEmergencyRequests } from "@/hooks/useEmergencyDispatch";
+import { apiClient } from "@/api/client";

// Replace queries
-const { data: requests = [], isLoading } = useQuery({
-  queryKey: ["emergency-requests"],
-  queryFn: () => base44.entities.EmergencyRequest.list("-created_date", 100),
-  refetchInterval: 30000,
-});
+const { data: requests = [], isLoading } = useEmergencyRequests({ 
+  queryOptions: { refetchInterval: 30000 } 
+});

// Note: Real-time subscription not available
// Remove: base44.entities.EmergencyRequest.subscribe()
// Replace with: refetchInterval or manual refresh

// Property changes:
// r.emergency_type → r.type
// r.created_date → r.createdAt
// r.victim_name → (add to schema if needed)
```

#### 7. BreakGlass.jsx
```javascript
// Replace auth
-useEffect(() => {
-  base44.auth.me().then(setCurrentUser).catch(() => {});
-}, []);
+const { user: currentUser } = useAuth();

// Replace query
-const { data: events = [], isLoading } = useQuery({
-  queryKey: ["break-glass-events"],
-  queryFn: () => base44.entities.BreakGlassEvent.list("-created_date", 50),
-});
+const { data: events = [], isLoading } = useQuery({
+  queryKey: ["break-glass-events"],
+  queryFn: () => apiClient.get(endpoints.breakGlass),
+});

// Replace create mutation
-const createMutation = useMutation({
-  mutationFn: async (data) => {
-    const user = await base44.auth.me();
-    return base44.entities.BreakGlassEvent.create({
-      ...data,
-      requester_email: user.email,
-      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
-    });
-  },
-});
+const createMutation = useMutation({
+  mutationFn: (data) => apiClient.post(endpoints.breakGlass, {
+    reason: data.justification,
+    duration: 4,
+  }),
+});

// Property changes:
// e.requester_email → from user relation
// e.created_date → e.createdAt
// e.review_status → (add to schema)
```

#### 8. Settings.jsx
```javascript
// Replace auth query
-const { data: user, isLoading } = useQuery({
-  queryKey: ["current-user"],
-  queryFn: () => base44.auth.me(),
-});
+const { user, isLoading } = useAuth();

// Replace update mutations
-const updateProfileMutation = useMutation({
-  mutationFn: (data) => base44.auth.updateMe(data),
-});
+const { updateUser } = useAuth();
+const updateProfileMutation = useMutation({
+  mutationFn: (data) => updateUser(data),
+});

// Property changes:
// user.full_name → user.fullName
```

---

## Status/Enum Value Mappings

### Disaster Status
| Old | New |
|-----|-----|
| `active` | `ACTIVE` |
| `closed` | `RESOLVED` |
| `monitoring` | `MONITORING` |

### Volunteer Status
| Old | New |
|-----|-----|
| `available` | `AVAILABLE` |
| `on_duty` | `ON_DUTY` |
| `unavailable` | `UNAVAILABLE` |

### Survivor Status
| Old | New |
|-----|-----|
| `registered` | `REGISTERED` |
| `sheltered` | `SAFE` |
| `assisted` | `INJURED` |
| `relocated` | `RELOCATED` |

### Location Status
| Old | New |
|-----|-----|
| `open` | `OPEN` |
| `full` | `FULL` |
| `closed` | `CLOSED` |
| `setup` | `LIMITED` |

---

## Features Not Available

### ❌ Real-time Subscriptions
```javascript
// This doesn't exist in new system:
base44.entities.X.subscribe(callback)

// Alternative: Use polling with refetchInterval
const { data } = useQuery({
  queryKey: ['xs'],
  queryFn: fetchXs,
  refetchInterval: 30000, // Poll every 30 seconds
});
```

### ❌ InvokeLLM (AI predictions)
```javascript
// This doesn't exist:
base44.integrations.Core.InvokeLLM()

// Alternative: Implement with external AI service
```

### ❌ App Logs
```javascript
// This doesn't exist:
base44.appLogs.logUserInApp()

// Alternative: Use AuditLog entity
apiClient.post('/audit-logs', { action, entity, details })
```

---

## Testing Checklist

After migrating each file:

1. **Check imports** - No more `base44` imports
2. **Check property names** - All camelCase
3. **Check status values** - All UPPERCASE
4. **Run dev server** - `npm run dev`
5. **Test CRUD operations** - Create, Read, Update work
6. **Check console** - No errors

---

*Created: March 3, 2026*

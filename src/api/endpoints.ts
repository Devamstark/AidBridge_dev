export const endpoints = {
  // Auth
  authMe: '/auth/me',
  authLogin: '/auth/login',
  authUpdate: '/auth/update',
  
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
  
  // Break Glass
  breakGlass: '/break-glass',
}

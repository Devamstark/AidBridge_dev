import React, { createContext, useState, useContext, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { mockUsers } from '@/lib/mockData'

const AuthContext = createContext()

const STORAGE_KEY = 'aidbridge_auth_state'
const USER_KEY = 'aidbridge_user_data'

// Role permissions
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  VOLUNTEER: 'VOLUNTEER',
  PUBLIC: 'PUBLIC',
}

// Permission matrix
export const PERMISSIONS = {
  VIEW: {
    Dashboard: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.VOLUNTEER],
    Disasters: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.VOLUNTEER],
    Survivors: [ROLES.ADMIN, ROLES.COORDINATOR],
    SurvivorIntake: [ROLES.ADMIN, ROLES.COORDINATOR],
    Volunteers: [ROLES.ADMIN, ROLES.COORDINATOR],
    VolunteerProfiles: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.VOLUNTEER],
    Locations: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.VOLUNTEER],
    Resources: [ROLES.ADMIN, ROLES.COORDINATOR],
    Distributions: [ROLES.ADMIN, ROLES.COORDINATOR],
    EmergencyDispatch: [ROLES.ADMIN, ROLES.COORDINATOR],
    BreakGlass: [ROLES.ADMIN],
    Settings: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.VOLUNTEER],
  },
  CREATE: {
    Disaster: [ROLES.ADMIN, ROLES.COORDINATOR],
    Survivor: [ROLES.ADMIN, ROLES.COORDINATOR],
    Volunteer: [ROLES.ADMIN, ROLES.COORDINATOR],
    Location: [ROLES.ADMIN, ROLES.COORDINATOR],
    Resource: [ROLES.ADMIN, ROLES.COORDINATOR],
    Distribution: [ROLES.ADMIN, ROLES.COORDINATOR],
    EmergencyRequest: [ROLES.ADMIN, ROLES.COORDINATOR],
  },
  DELETE: {
    Disaster: [ROLES.ADMIN],
    Survivor: [ROLES.ADMIN],
    Volunteer: [ROLES.ADMIN],
    Location: [ROLES.ADMIN],
    Resource: [ROLES.ADMIN],
    Distribution: [ROLES.ADMIN],
    EmergencyRequest: [ROLES.ADMIN],
  },
}

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
      const storedAuth = sessionStorage.getItem(STORAGE_KEY)
      const storedUser = sessionStorage.getItem(USER_KEY)
      
      if (storedAuth === 'true' && storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
        setAuthError(null)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const login = async (email, password) => {
    console.log('Login attempt:', email)
    if (email && password) {
      setUser(mockUsers.ADMIN) // Default to admin for backward compatibility
      setIsAuthenticated(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
      sessionStorage.setItem(USER_KEY, JSON.stringify(mockUsers.ADMIN))
      return { token: 'mock_token', user: mockUsers.ADMIN }
    }
    throw new Error('Invalid credentials')
  }

  const loginAsRole = async (role) => {
    const userData = mockUsers[role]
    if (userData) {
      setUser(userData)
      setIsAuthenticated(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData))
      return { token: 'mock_token', user: userData }
    }
    throw new Error('Invalid role')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(USER_KEY)
    window.location.href = '/login'
  }

  const updateUser = async (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    sessionStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  }

  const canView = (pageName) => {
    if (!isAuthenticated) return false
    const allowedRoles = PERMISSIONS.VIEW[pageName] || []
    return allowedRoles.includes(user?.role)
  }

  const canCreate = (entityName) => {
    if (!isAuthenticated) return false
    const allowedRoles = PERMISSIONS.CREATE[entityName] || []
    return allowedRoles.includes(user?.role)
  }

  const canDelete = (entityName) => {
    if (!isAuthenticated) return false
    const allowedRoles = PERMISSIONS.DELETE[entityName] || []
    return allowedRoles.includes(user?.role)
  }

  const isAdmin = () => {
    return isAuthenticated && user?.role === ROLES.ADMIN
  }

  const isCoordinatorOrHigher = () => {
    return isAuthenticated && 
      (user?.role === ROLES.ADMIN || user?.role === ROLES.COORDINATOR)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      login,
      loginAsRole,
      logout,
      updateUser,
      canView,
      canCreate,
      canDelete,
      isAdmin,
      isCoordinatorOrHigher,
      ROLES,
      PERMISSIONS,
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

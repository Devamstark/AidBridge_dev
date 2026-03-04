import React, { createContext, useState, useContext, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { mockUsers } from '@/lib/mockData'

const AuthContext = createContext(null)

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
  const hasCheckedAuth = React.useRef(false)

  const checkAuth = React.useCallback(async () => {
    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    try {
      setIsLoadingAuth(true)
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const userData = await apiClient.get('/auth/me')
          setUser(userData)
          setIsAuthenticated(true)
          setAuthError(null)
        } catch (err) {
          console.error('Session validation failed:', err)
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
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
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    console.log('Real login attempt:', email)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { token, user: userData } = response

      localStorage.setItem('token', token)
      setUser(userData)
      setIsAuthenticated(true)
      return { token, user: userData }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const loginAsRole = async (role) => {
    // For demo purposes, we still allow legacy role login by mapping to mock emails if needed,
    // but the user wants real login. 
    // I will keep this for local testing if the user clicks role buttons, 
    // but redirected to a real login soon.
    const userData = mockUsers[role]
    if (userData) {
      setUser(userData)
      setIsAuthenticated(true)
      // Note: This won't work for real API calls without a real token
      return { token: 'mock_token', user: userData }
    }
    throw new Error('Invalid role')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
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

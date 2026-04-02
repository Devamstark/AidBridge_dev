import axios, { AxiosInstance, AxiosError } from 'axios'
import * as mock from '@/lib/mockData'

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api'
const USE_MOCK_DATA = true // Set to true for local testing without backend

// In-memory storage for mock data
const mockStorage = {
  disasters: [...mock.mockDisasters],
  volunteers: [...mock.mockVolunteers],
  survivors: [...mock.mockSurvivors],
  locations: [...mock.mockLocations],
  resources: [...mock.mockResources],
  distributions: [...mock.mockDistributions],
  helpRequests: [],
  survivorRegistrations: [],
}

// Generate ID helper
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Mock API responses
const mockApi = {
  async get(endpoint: string, params?: any) {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay

    if (endpoint.includes('/auth/me')) return mock.mockUsers.ADMIN
    if (endpoint.includes('/disasters')) return mockStorage.disasters
    if (endpoint.includes('/volunteers')) return mockStorage.volunteers
    if (endpoint.includes('/survivors')) return mockStorage.survivors
    if (endpoint.includes('/locations')) return mockStorage.locations
    if (endpoint.includes('/resources')) return mockStorage.resources
    if (endpoint.includes('/distributions')) return mockStorage.distributions
    if (endpoint.includes('/dispatch/requests')) return mockStorage.helpRequests || []
    if (endpoint.includes('/public/help')) return mockStorage.helpRequests || []

    return []
  },

  async post(endpoint: string, data?: any) {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Mock POST to', endpoint, data)

    if (endpoint.includes('/auth/login')) {
      const { email, password } = data;
      // Find user by email and password
      const user = Object.values(mock.mockUsers).find(u => u.email === email && u.password === password);
      if (user) {
        return {
          token: `mock_token_${user.role}_${Date.now()}`,
          user
        };
      }
      throw { status: 401, message: 'Invalid credentials' };
    }

    if (endpoint.includes('/disasters')) {
      const newDisaster = {
        id: generateId('disaster'),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStorage.disasters.unshift(newDisaster)
      return newDisaster
    }

    if (endpoint.includes('/volunteers')) {
      const newVolunteer = {
        id: generateId('volunteer'),
        ...data,
        status: data.status || 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          fullName: `${data.firstName || 'Volunteer'} ${data.lastName || ''}`,
          email: data.email || '',
          phone: data.phone || '',
        },
      }
      mockStorage.volunteers.unshift(newVolunteer)
      return newVolunteer
    }

    if (endpoint.includes('/survivors')) {
      const newSurvivor = {
        id: generateId('survivor'),
        ...data,
        status: data.status || 'REGISTERED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStorage.survivors.unshift(newSurvivor)
      return newSurvivor
    }

    if (endpoint.includes('/locations')) {
      const newLocation = {
        id: generateId('location'),
        ...data,
        operationalStatus: data.operationalStatus || 'OPEN',
        currentOccupancy: data.currentOccupancy || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStorage.locations.unshift(newLocation)
      return newLocation
    }

    if (endpoint.includes('/resources')) {
      const newResource = {
        id: generateId('resource'),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStorage.resources.unshift(newResource)
      return newResource
    }

    if (endpoint.includes('/distributions')) {
      const newDistribution = {
        id: generateId('distribution'),
        ...data,
        status: data.status || 'PLANNED',
        quantityDistributed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStorage.distributions.unshift(newDistribution)
      return newDistribution
    }

    if (endpoint.includes('/public/help')) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(100 + Math.random() * 900)
      const requestId = `REQ-${dateStr}-${randomNum}`
      const newHelpRequest = {
        id: generateId('help'),
        requestId,
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      mockStorage.helpRequests = mockStorage.helpRequests || []
      mockStorage.helpRequests.unshift(newHelpRequest)
      return { requestId, status: 'PENDING', message: 'Help request submitted' }
    }

    if (endpoint.includes('/public/survivor/register')) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const caseNumber = `SRV-${dateStr}-${randomNum}`
      const newRegistration = {
        id: generateId('registration'),
        caseNumber,
        ...data,
        createdAt: new Date().toISOString(),
      }
      mockStorage.survivorRegistrations = mockStorage.survivorRegistrations || []
      mockStorage.survivorRegistrations.unshift(newRegistration)
      return { caseNumber, status: 'PENDING', message: 'Registration submitted' }
    }

    return { id: generateId('item'), ...data, createdAt: new Date().toISOString() }
  },

  async put(endpoint: string, data?: any) {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Mock PUT to', endpoint, data)

    // Extract ID from endpoint
    const idMatch = endpoint.match(/\/(\w+)(?:\?|$)/)
    const id = idMatch ? idMatch[1] : 'unknown'

    return { id, ...data, updatedAt: new Date().toISOString() }
  },

  async delete(endpoint: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Mock DELETE', endpoint)
    return { success: true }
  },
}

interface ApiError {
  status?: number
  message: string
  data?: any
}

class ApiClient {
  private client: AxiosInstance
  private useMock: boolean

  constructor() {
    this.useMock = USE_MOCK_DATA
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!this.useMock) {
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
          const originalRequest = error.config as any

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            localStorage.removeItem('token')
            // Only redirect if not already on the login page to prevent routing loops
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }

          return Promise.reject(this.handleError(error))
        }
      )
    }
  }

  private handleError(error: AxiosError): ApiError {
    const data = error.response?.data as any
    return {
      status: error.response?.status,
      message: data?.error || data?.message || error.message || 'An error occurred',
      data: data,
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    if (this.useMock) {
      return mockApi.get(url, params) as Promise<T>
    }
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    if (this.useMock) {
      return mockApi.post(url, data) as Promise<T>
    }
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    if (this.useMock) {
      return mockApi.put(url, data) as Promise<T>
    }
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    if (this.useMock) {
      return mockApi.delete(url) as Promise<T>
    }
    const response = await this.client.delete<T>(url)
    return response.data
  }
}

export const apiClient = new ApiClient()

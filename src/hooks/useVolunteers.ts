import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useVolunteers(filters) {
  return useQuery({
    queryKey: ['volunteers', filters],
    queryFn: () => apiClient.get(endpoints.volunteers, filters),
  })
}

export function useVolunteer(id) {
  return useQuery({
    queryKey: ['volunteer', id],
    queryFn: () => apiClient.get(endpoints.volunteer(id)),
    enabled: !!id,
  })
}

export function useCreateVolunteer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.volunteers, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    },
  })
}

export function useUpdateVolunteer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(endpoints.volunteer(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
      queryClient.invalidateQueries({ queryKey: ['volunteer', id] })
    },
  })
}

export function useVolunteerStatusCheck() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.volunteerStatusCheck, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    },
  })
}

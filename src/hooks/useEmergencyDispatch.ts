import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useEmergencyRequests(filters) {
  return useQuery({
    queryKey: ['emergencyRequests', filters],
    queryFn: () => apiClient.get(endpoints.dispatchRequests, filters),
  })
}

export function useUpdateEmergencyRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`${endpoints.dispatchRequests}?id=${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequests'] })
    },
  })
}

export function useTriggerDispatch() {
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.dispatchTrigger, data),
  })
}

export function useDisasterAlert() {
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.disasterAlerts, data),
  })
}

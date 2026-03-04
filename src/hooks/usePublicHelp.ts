import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function usePublicHelpRequests(filters) {
  return useQuery({
    queryKey: ['publicHelpRequests', filters],
    queryFn: () => apiClient.get('/dispatch/requests', { ...filters, type: 'public' }),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useAssignVolunteer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ requestId, volunteerId }) => 
      apiClient.put(`/dispatch/requests/${requestId}/assign`, { volunteerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicHelpRequests'] })
      queryClient.invalidateQueries({ queryKey: ['emergencyRequests'] })
    },
  })
}

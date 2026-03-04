import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useDistributions(filters) {
  return useQuery({
    queryKey: ['distributions', filters],
    queryFn: () => apiClient.get(endpoints.distributions, filters),
  })
}

export function useCreateDistribution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.distributions, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] })
    },
  })
}

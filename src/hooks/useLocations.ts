import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useLocations(filters) {
  return useQuery({
    queryKey: ['locations', filters],
    queryFn: () => apiClient.get(endpoints.locations, filters),
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.locations, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

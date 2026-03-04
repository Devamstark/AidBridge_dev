import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useResources(filters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => apiClient.get(endpoints.resources, filters),
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.resources, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

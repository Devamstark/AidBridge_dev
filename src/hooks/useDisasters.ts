import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useDisasters(filters) {
  return useQuery({
    queryKey: ['disasters', filters],
    queryFn: () => apiClient.get(endpoints.disasters, filters),
    enabled: true,
  })
}

export function useDisaster(id) {
  return useQuery({
    queryKey: ['disaster', id],
    queryFn: () => apiClient.get(endpoints.disaster(id)),
    enabled: !!id,
  })
}

export function useCreateDisaster() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.disasters, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] })
    },
  })
}

export function useUpdateDisaster() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(endpoints.disaster(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] })
      queryClient.invalidateQueries({ queryKey: ['disaster', id] })
    },
  })
}

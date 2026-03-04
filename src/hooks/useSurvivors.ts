import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { endpoints } from '@/api/endpoints'

export function useSurvivors(filters) {
  return useQuery({
    queryKey: ['survivors', filters],
    queryFn: () => apiClient.get(endpoints.survivors, filters),
  })
}

export function useSurvivor(id) {
  return useQuery({
    queryKey: ['survivor', id],
    queryFn: () => apiClient.get(endpoints.survivor(id)),
    enabled: !!id,
  })
}

export function useCreateSurvivor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.post(endpoints.survivors, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survivors'] })
    },
  })
}

export function useUpdateSurvivor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put(endpoints.survivor(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['survivors'] })
      queryClient.invalidateQueries({ queryKey: ['survivor', id] })
    },
  })
}

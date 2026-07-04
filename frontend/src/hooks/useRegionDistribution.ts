import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export function useRegionDistribution() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'regions'],
    queryFn: () => dashboardService.getRegionsDistribution(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    regions: data?.regions ?? [],
    isLoading,
    isError,
    refetch,
  }
}

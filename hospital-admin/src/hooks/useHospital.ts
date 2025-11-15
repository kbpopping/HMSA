import { useQuery } from '@tanstack/react-query';
import { HospitalAPI } from '../api/endpoints';
import { useAuth } from '../store/auth';

/**
 * Custom hook to fetch hospital data
 * Ensures hospital information is consistently fetched and cached across the app
 */
export const useHospital = () => {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  const { data: hospital, isLoading, error } = useQuery({
    queryKey: ['hospital', 'me', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.me(hospitalId);
        console.log('[useHospital] Fetched hospital:', result);
        return result;
      } catch (err) {
        console.error('Error fetching hospital:', err);
        return null;
      }
    },
    staleTime: 0, // Always refetch when invalidated
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    hospital,
    hospitalName: hospital?.name || 'Hospital',
    hospitalCountry: hospital?.country || '',
    hospitalTimezone: hospital?.timezone || 'America/Los_Angeles',
    isLoading,
    error,
  };
};


import { useQuery } from '@tanstack/react-query';
import { scheduleApi } from '../../api/schedule';

export const TIME_SLOTS_QUERY_KEY = ['timeSlots'];

/**
 * Hook to fetch schedule time slots.
 * Time slots rarely change, so we can configure a longer stale time if needed,
 * or just rely on the global configuration.
 */
export const useTimeSlots = () => {
  return useQuery({
    queryKey: TIME_SLOTS_QUERY_KEY,
    queryFn: scheduleApi.getTimeSlots,
    // Override global staleTime for time slots since they are static
    staleTime: Infinity, 
  });
};

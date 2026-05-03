import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, Assignment } from '../../api/assignments';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const SCHEDULE_QUERY_KEY = ['schedule'];

export const useSchedule = (year?: string, semester?: string, specialization?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...SCHEDULE_QUERY_KEY, year, semester, specialization],
    queryFn: () => assignmentsApi.getAll(year, semester, specialization),
  });

  // Function to prefetch data for other specializations or semesters (e.g., adjacent weeks)
  const prefetchSchedule = async (pYear?: string, pSemester?: string, pSpecialization?: string) => {
    await queryClient.prefetchQuery({
      queryKey: [...SCHEDULE_QUERY_KEY, pYear, pSemester, pSpecialization],
      queryFn: () => assignmentsApi.getAll(pYear, pSemester, pSpecialization),
      staleTime: 30 * 1000,
    });
  };

  return { ...query, prefetchSchedule };
};

export const useUpdateScheduleAssignment = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: assignmentsApi.update,
    onMutate: async ({ id, data: updatedAssignment }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: SCHEDULE_QUERY_KEY });

      // Snapshot previous data for rollback (can be multiple queries due to filters)
      const previousQueries = queryClient.getQueriesData<Assignment[]>({ queryKey: SCHEDULE_QUERY_KEY });

      // Optimistically update all queries that might contain this assignment
      queryClient.setQueriesData<Assignment[]>(
        { queryKey: SCHEDULE_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((assignment) =>
            assignment.id === id ? { ...assignment, ...updatedAssignment } : assignment
          );
        }
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
      addNotification({ type: 'error', message: 'فشل في تحديث الجدول' });
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث الجدول بنجاح' });
    },
    onSettled: () => {
      // Always refetch to ensure synchronization with the server/DB
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, Assignment } from '../../api/assignments';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const ASSIGNMENTS_QUERY_KEY = ['assignments'];

export const useAssignments = (year?: string, semester?: string, specialization?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, year, semester, specialization],
    queryFn: () => assignmentsApi.getAll(year, semester, specialization),
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: assignmentsApi.create,
    onMutate: async (newAssignment) => {
      // Optimitic update logic is complex here because we might have year/semester keys
      // It's safer to invalidate or handle in a specific way. For now, we'll try to update all matching keys
      await queryClient.cancelQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      // We will rely on invalidation for complex list updates unless we specifically know the key
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة الحصة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: assignmentsApi.update,
    onMutate: async (updatedAssignment) => {
      await queryClient.cancelQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      // In a real app we'd optimistically update all cache entries containing this assignment
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث الحصة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: assignmentsApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف الحصة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
  });
};

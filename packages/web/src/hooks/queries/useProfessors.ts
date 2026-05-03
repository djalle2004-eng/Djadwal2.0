import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professorsApi, Professor } from '../../api/professors';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const PROFESSORS_QUERY_KEY = ['professors'];

export const useProfessors = () => {
  return useQuery({
    queryKey: PROFESSORS_QUERY_KEY,
    queryFn: professorsApi.getAll,
  });
};

export const useProfessor = (id: number) => {
  return useQuery({
    queryKey: [...PROFESSORS_QUERY_KEY, id],
    queryFn: () => professorsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProfessor = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: professorsApi.create,
    onMutate: async (newProfessor) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: PROFESSORS_QUERY_KEY });

      // Snapshot the previous value
      const previousProfessors = queryClient.getQueryData<Professor[]>(PROFESSORS_QUERY_KEY);

      // Optimistically update to the new value
      if (previousProfessors) {
        queryClient.setQueryData<Professor[]>(PROFESSORS_QUERY_KEY, [
          ...previousProfessors,
          { id: Math.random(), ...newProfessor } as Professor,
        ]);
      }

      return { previousProfessors };
    },
    onError: (err, newProfessor, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfessors) {
        queryClient.setQueryData(PROFESSORS_QUERY_KEY, context.previousProfessors);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة الأستاذ بنجاح' });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};

export const useUpdateProfessor = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: professorsApi.update,
    onMutate: async (updatedProfessor) => {
      await queryClient.cancelQueries({ queryKey: PROFESSORS_QUERY_KEY });
      const previousProfessors = queryClient.getQueryData<Professor[]>(PROFESSORS_QUERY_KEY);

      if (previousProfessors) {
        queryClient.setQueryData<Professor[]>(PROFESSORS_QUERY_KEY, 
          previousProfessors.map(p => p.id === updatedProfessor.id ? { ...p, ...updatedProfessor.data } : p)
        );
      }

      return { previousProfessors };
    },
    onError: (err, newProfessor, context) => {
      if (context?.previousProfessors) {
        queryClient.setQueryData(PROFESSORS_QUERY_KEY, context.previousProfessors);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث الأستاذ بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};

export const useDeleteProfessor = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: professorsApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PROFESSORS_QUERY_KEY });
      const previousProfessors = queryClient.getQueryData<Professor[]>(PROFESSORS_QUERY_KEY);

      if (previousProfessors) {
        queryClient.setQueryData<Professor[]>(PROFESSORS_QUERY_KEY, 
          previousProfessors.filter(p => p.id !== id)
        );
      }

      return { previousProfessors };
    },
    onError: (err, id, context) => {
      if (context?.previousProfessors) {
        queryClient.setQueryData(PROFESSORS_QUERY_KEY, context.previousProfessors);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف الأستاذ بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};

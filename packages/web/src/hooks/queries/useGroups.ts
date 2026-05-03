import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi, Group, Department } from '../../api/groups';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const GROUPS_QUERY_KEY = ['groups'];
export const DEPARTMENTS_QUERY_KEY = ['departments'];

export const useGroups = () => {
  return useQuery({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: groupsApi.getAll,
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: groupsApi.getDepartments,
  });
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, id],
    queryFn: () => groupsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: groupsApi.create,
    onMutate: async (newGroupName) => {
      await queryClient.cancelQueries({ queryKey: GROUPS_QUERY_KEY });
      const previousGroups = queryClient.getQueryData<Group[]>(GROUPS_QUERY_KEY);

      if (previousGroups) {
        queryClient.setQueryData<Group[]>(GROUPS_QUERY_KEY, [
          ...previousGroups,
          { id: Math.random(), name: newGroupName } as Group,
        ]);
      }
      return { previousGroups };
    },
    onError: (err, newGroup, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(GROUPS_QUERY_KEY, context.previousGroups);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة الفوج بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: groupsApi.update,
    onMutate: async ({ id, newName }) => {
      await queryClient.cancelQueries({ queryKey: GROUPS_QUERY_KEY });
      const previousGroups = queryClient.getQueryData<Group[]>(GROUPS_QUERY_KEY);

      if (previousGroups) {
        queryClient.setQueryData<Group[]>(GROUPS_QUERY_KEY, 
          previousGroups.map(g => g.id === id ? { ...g, name: newName } : g)
        );
      }
      return { previousGroups };
    },
    onError: (err, newGroup, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(GROUPS_QUERY_KEY, context.previousGroups);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث الفوج بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: groupsApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GROUPS_QUERY_KEY });
      const previousGroups = queryClient.getQueryData<Group[]>(GROUPS_QUERY_KEY);

      if (previousGroups) {
        queryClient.setQueryData<Group[]>(GROUPS_QUERY_KEY, 
          previousGroups.filter(g => g.id !== id)
        );
      }
      return { previousGroups };
    },
    onError: (err, id, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(GROUPS_QUERY_KEY, context.previousGroups);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف الفوج بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
};

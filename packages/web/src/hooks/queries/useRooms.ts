import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, Room } from '../../api/rooms';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const ROOMS_QUERY_KEY = ['rooms'];

export const useRooms = () => {
  return useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: roomsApi.getAll,
  });
};

export const useRoom = (id: number) => {
  return useQuery({
    queryKey: [...ROOMS_QUERY_KEY, id],
    queryFn: () => roomsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: roomsApi.create,
    onMutate: async (newRoom) => {
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY });
      const previousRooms = queryClient.getQueryData<Room[]>(ROOMS_QUERY_KEY);

      if (previousRooms) {
        queryClient.setQueryData<Room[]>(ROOMS_QUERY_KEY, [
          ...previousRooms,
          { id: Math.random(), ...newRoom } as Room,
        ]);
      }
      return { previousRooms };
    },
    onError: (err, newRoom, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(ROOMS_QUERY_KEY, context.previousRooms);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة القاعة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: roomsApi.update,
    onMutate: async (updatedRoom) => {
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY });
      const previousRooms = queryClient.getQueryData<Room[]>(ROOMS_QUERY_KEY);

      if (previousRooms) {
        queryClient.setQueryData<Room[]>(ROOMS_QUERY_KEY, 
          previousRooms.map(r => r.id === updatedRoom.id ? { ...r, ...updatedRoom.data } : r)
        );
      }
      return { previousRooms };
    },
    onError: (err, newRoom, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(ROOMS_QUERY_KEY, context.previousRooms);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث القاعة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: roomsApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY });
      const previousRooms = queryClient.getQueryData<Room[]>(ROOMS_QUERY_KEY);

      if (previousRooms) {
        queryClient.setQueryData<Room[]>(ROOMS_QUERY_KEY, 
          previousRooms.filter(r => r.id !== id)
        );
      }
      return { previousRooms };
    },
    onError: (err, id, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(ROOMS_QUERY_KEY, context.previousRooms);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف القاعة بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
  });
};

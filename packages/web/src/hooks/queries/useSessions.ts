import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, ExtraSession } from '../../api/sessions';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const EXTRA_SESSIONS_QUERY_KEY = ['extraSessions'];

export const useExtraSessions = () => {
  return useQuery({
    queryKey: EXTRA_SESSIONS_QUERY_KEY,
    queryFn: sessionsApi.getExtraSessions,
  });
};

export const useCreateExtraSession = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: sessionsApi.createExtraSession,
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة الحصة الإضافية بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXTRA_SESSIONS_QUERY_KEY });
    },
  });
};

export const useUpdateExtraSession = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: sessionsApi.updateExtraSession,
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث الحصة الإضافية بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXTRA_SESSIONS_QUERY_KEY });
    },
  });
};

export const useDeleteExtraSession = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: sessionsApi.deleteExtraSession,
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف الحصة الإضافية بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXTRA_SESSIONS_QUERY_KEY });
    },
  });
};

import { QueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../stores/useNotificationStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds for schedule data
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount) => {
        // Retry 3 times with exponential backoff
        if (failureCount >= 3) return false;
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Background sync when app regains focus
    },
    mutations: {
      onError: (error) => {
        // Global error handler for mutations
        console.error('Mutation error:', error);
        useNotificationStore.getState().addNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ البيانات',
        });
      },
    },
  },
});

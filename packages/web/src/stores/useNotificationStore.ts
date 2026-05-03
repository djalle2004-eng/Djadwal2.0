import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => {
          state.notifications.push({ ...notification, id });
        });

        if (notification.duration !== 0) {
          setTimeout(() => {
            set((state) => {
              state.notifications = state.notifications.filter((n) => n.id !== id);
            });
          }, notification.duration || 5000);
        }
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        });
      }
    }))
  )
);

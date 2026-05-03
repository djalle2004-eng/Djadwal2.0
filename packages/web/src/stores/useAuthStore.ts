import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User, LoginCredentials } from '../types/shared';
import * as authService from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          user: null,
          isLoading: false,
          error: null,

          setUser: (user) => {
            set((state) => {
              state.user = user;
            });
          },

          signIn: async (credentials) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            try {
              const { user } = await authService.login(credentials);
              set((state) => {
                state.user = user;
                state.isLoading = false;
              });
            } catch (error: any) {
              set((state) => {
                state.error = error.message || 'Failed to sign in';
                state.isLoading = false;
              });
              throw error;
            }
          },

          signOut: async () => {
            set((state) => {
              state.isLoading = true;
            });
            try {
              await authService.logout();
              set((state) => {
                state.user = null;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.user = null;
                state.isLoading = false;
              });
            }
          },

          reset: () => {
            set((state) => {
              state.user = null;
              state.isLoading = false;
              state.error = null;
            });
          },
        }),
        {
          name: 'djadwal-auth-storage',
          partialize: (state) => ({ user: state.user }), // Persist only user (which includes token if stored there)
        }
      )
    )
  )
);

// Derived selectors
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
export const useIsScheduleManager = () => useAuthStore((state) => state.user?.role === 'schedule_manager');
export const useIsProfessor = () => useAuthStore((state) => state.user?.role === 'professor');
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  return (action: 'view' | 'create' | 'update' | 'delete', resource: string) => 
    authService.hasPermission(user, action, resource);
};

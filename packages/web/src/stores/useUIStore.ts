import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  sidebarOpen: boolean;
  activeModals: Record<string, boolean>;
  theme: 'light' | 'dark';
  
  // Actions
  toggleSidebar: () => void;
  setModalOpen: (modalId: string, isOpen: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          sidebarOpen: true,
          activeModals: {},
          theme: 'light',

          toggleSidebar: () => {
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            });
          },

          setModalOpen: (modalId, isOpen) => {
            set((state) => {
              state.activeModals[modalId] = isOpen;
            });
          },

          setTheme: (theme) => {
            set((state) => {
              state.theme = theme;
            });
          }
        }),
        {
          name: 'djadwal-ui-storage',
        }
      )
    )
  )
);

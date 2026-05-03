import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Group {
  id: number;
  name: string;
  department_id: number;
  group_type: string;
  specialization: string;
  parent_group_id?: number;
  year: number;
}

interface GroupsState {
  groups: Group[];
  departments: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGroups: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  addGroup: (group: Partial<Group>) => Promise<Group>;
  updateGroup: (id: number, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  deleteAllGroups: () => Promise<void>;
}

export const useGroupsStore = create<GroupsState>()(
  devtools(
    immer((set) => ({
      groups: [],
      departments: [],
      isLoading: false,
      error: null,

      fetchGroups: async () => {
        set((state) => { state.isLoading = true; });
        try {
          const fetched = await window.db.getGroups();
          set((state) => {
            state.groups = fetched;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },

      fetchDepartments: async () => {
        try {
          const fetched = await window.db.getDepartments();
          set((state) => {
            state.departments = fetched;
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
        }
      },

      addGroup: async (group) => {
        try {
          const result = await window.db.addGroup(group);
          set((state) => {
            state.groups.push(result);
          });
          return result;
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      updateGroup: async (id, group) => {
        try {
          const result = await window.db.updateGroup(id, group);
          set((state) => {
            const idx = state.groups.findIndex(g => g.id === id);
            if (idx !== -1) state.groups[idx] = result;
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteGroup: async (id) => {
        try {
          await window.db.deleteGroup(id);
          set((state) => {
            state.groups = state.groups.filter(g => g.id !== id);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteAllGroups: async () => {
        try {
          await window.db.deleteAllGroups();
          set((state) => {
            state.groups = [];
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      }
    }))
  )
);

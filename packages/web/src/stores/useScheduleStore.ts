import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useAcademicStore } from './useAcademicStore';

export interface Assignment {
  id?: number;
  group_id: number;
  course_id: number;
  professor_id: number;
  room_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  academic_year?: string;
  semester?: string;
  specialization?: string;
  group_name?: string;
  course_name?: string;
  professor_name?: string;
  room_name?: string;
}

interface ScheduleState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  draggedAssignment: Assignment | null;

  // Actions
  fetchAssignments: (specialization?: string) => Promise<void>;
  addAssignment: (assignment: Assignment) => Promise<void>;
  updateAssignment: (id: number, assignment: Assignment) => Promise<void>;
  deleteAssignment: (id: number) => Promise<void>;
  setDraggedAssignment: (assignment: Assignment | null) => void;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  devtools(
    immer((set, get) => ({
      assignments: [],
      isLoading: false,
      error: null,
      draggedAssignment: null,

      fetchAssignments: async (specialization = '') => {
        const { currentYear, currentSemester } = useAcademicStore.getState();
        if (!currentYear || !currentSemester) return;

        set((state) => { state.isLoading = true; });
        try {
          // Using window.db as in the original code
          const fetched = await window.db.getAssignments(
            currentYear.year_name,
            currentSemester.semester_name,
            specialization
          );
          set((state) => {
            state.assignments = fetched;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },

      addAssignment: async (assignment) => {
        set((state) => { state.isLoading = true; });
        try {
          const result = await window.db.addAssignment(assignment);
          set((state) => {
            state.assignments.push(result);
            state.isLoading = false;
          });
          window.dispatchEvent(new CustomEvent('assignment-changed', { 
            detail: { action: 'add', assignment: result } 
          }));
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          throw error;
        }
      },

      updateAssignment: async (id, assignment) => {
        set((state) => { state.isLoading = true; });
        try {
          const result = await window.db.updateAssignment(id, assignment);
          set((state) => {
            const idx = state.assignments.findIndex(a => a.id === id);
            if (idx !== -1) state.assignments[idx] = result;
            state.isLoading = false;
          });
          window.dispatchEvent(new CustomEvent('assignment-changed', { 
            detail: { action: 'update', assignment: result } 
          }));
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          throw error;
        }
      },

      deleteAssignment: async (id) => {
        set((state) => { state.isLoading = true; });
        try {
          await window.db.deleteAssignment(id);
          set((state) => {
            state.assignments = state.assignments.filter(a => a.id !== id);
            state.isLoading = false;
          });
          window.dispatchEvent(new CustomEvent('assignment-changed', { 
            detail: { action: 'delete', id } 
          }));
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          throw error;
        }
      },

      setDraggedAssignment: (assignment) => {
        set((state) => {
          state.draggedAssignment = assignment;
        });
      },

      reset: () => {
        set((state) => {
          state.assignments = [];
          state.error = null;
          state.draggedAssignment = null;
        });
      }
    }))
  )
);

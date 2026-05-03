import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Professor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  academic_title?: string;
}

interface ProfessorsState {
  professors: Professor[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfessors: () => Promise<void>;
  addProfessor: (professor: Partial<Professor>) => Promise<void>;
  updateProfessor: (id: number, professor: Partial<Professor>) => Promise<void>;
  deleteProfessor: (id: number) => Promise<void>;
  deleteAllProfessors: () => Promise<void>;
}

export const useProfessorsStore = create<ProfessorsState>()(
  devtools(
    immer((set) => ({
      professors: [],
      isLoading: false,
      error: null,

      fetchProfessors: async () => {
        set((state) => { state.isLoading = true; });
        try {
          const fetched = await window.db.getProfessors();
          set((state) => {
            state.professors = fetched;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },

      addProfessor: async (professor) => {
        try {
          const result = await window.db.addProfessor(professor);
          set((state) => {
            state.professors.push(result);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      updateProfessor: async (id, professor) => {
        try {
          const result = await window.db.updateProfessor(id, professor);
          set((state) => {
            const idx = state.professors.findIndex(p => p.id === id);
            if (idx !== -1) state.professors[idx] = result;
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteProfessor: async (id) => {
        try {
          await window.db.deleteProfessor(id);
          set((state) => {
            state.professors = state.professors.filter(p => p.id !== id);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteAllProfessors: async () => {
        try {
          await window.db.deleteAllProfessors();
          set((state) => {
            state.professors = [];
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      }
    }))
  )
);

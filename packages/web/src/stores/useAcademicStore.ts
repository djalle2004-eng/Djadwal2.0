import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AcademicYear, Semester } from '../types/academicYear';
import * as academicYearService from '../services/academicYearService';

interface AcademicState {
  currentYear: AcademicYear | null;
  currentSemester: Semester | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentYear: (year: AcademicYear) => void;
  setCurrentSemester: (semester: Semester) => void;
  loadActiveSettings: () => Promise<void>;
  refreshCurrentSemester: () => Promise<void>;
  reset: () => void;
}

export const useAcademicStore = create<AcademicState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          currentYear: null,
          currentSemester: null,
          isLoading: false,
          error: null,

          setCurrentYear: (year) => {
            set((state) => {
              state.currentYear = year;
              state.currentSemester = null; // Reset semester when year changes
            });
          },

          setCurrentSemester: (semester) => {
            set((state) => {
              state.currentSemester = semester;
            });
          },

          loadActiveSettings: async () => {
            set((state) => { state.isLoading = true; });
            try {
              // If we already have something from persist, we might want to skip or verify
              // But let's follow the logic of loading active from DB if nothing valid
              const state = get();
              if (state.currentYear && state.currentSemester) {
                // Verify they match
                if (state.currentSemester.academic_year_id === state.currentYear.id) {
                  set((state) => { state.isLoading = false; });
                  return;
                }
              }

              const year = await academicYearService.getActiveAcademicYear();
              if (year) {
                set((state) => { state.currentYear = year; });
                const semester = await academicYearService.getActiveSemester(year.id);
                if (semester) {
                  set((state) => { state.currentSemester = semester; });
                }
              }
            } catch (error: any) {
              set((state) => { state.error = error.message; });
            } finally {
              set((state) => { state.isLoading = false; });
            }
          },

          refreshCurrentSemester: async () => {
            const { currentYear } = get();
            if (!currentYear) return;

            set((state) => { state.isLoading = true; });
            try {
              const semester = await academicYearService.getActiveSemester(currentYear.id);
              if (semester) {
                set((state) => { state.currentSemester = semester; });
              }
            } catch (error: any) {
              set((state) => { state.error = error.message; });
            } finally {
              set((state) => { state.isLoading = false; });
            }
          },

          reset: () => {
            set((state) => {
              state.currentYear = null;
              state.currentSemester = null;
              state.error = null;
            });
          }
        }),
        {
          name: 'djadwal-academic-storage',
          partialize: (state) => ({ 
            currentYear: state.currentYear, 
            currentSemester: state.currentSemester 
          }),
        }
      )
    )
  )
);

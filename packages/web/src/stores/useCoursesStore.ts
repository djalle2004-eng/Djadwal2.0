import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Course {
  id: number;
  name: string;
  code: string;
  metadata?: any;
}

interface CoursesState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCourses: () => Promise<void>;
  addCourse: (course: Partial<Course>) => Promise<void>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
}

export const useCoursesStore = create<CoursesState>()(
  devtools(
    immer((set) => ({
      courses: [],
      isLoading: false,
      error: null,

      fetchCourses: async () => {
        set((state) => { state.isLoading = true; });
        try {
          const fetched = await window.db.getCourses();
          set((state) => {
            state.courses = fetched;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },

      addCourse: async (course) => {
        try {
          const result = await window.db.addCourse(course);
          set((state) => {
            state.courses.push(result);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      updateCourse: async (id, course) => {
        try {
          const result = await window.db.updateCourse(id, course);
          set((state) => {
            const idx = state.courses.findIndex(c => c.id === id);
            if (idx !== -1) state.courses[idx] = result;
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteCourse: async (id) => {
        try {
          await window.db.deleteCourse(id);
          set((state) => {
            state.courses = state.courses.filter(c => c.id !== id);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      }
    }))
  )
);

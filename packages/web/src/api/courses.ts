export interface Course {
  id: number;
  name: string;
  code: string;
}

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    return await window.db.getCourses();
  },

  getById: async (id: number): Promise<Course | undefined> => {
    const courses = await window.db.getCourses();
    return courses.find((c: Course) => c.id === id);
  },

  create: async (course: Partial<Course>): Promise<Course> => {
    return await window.db.addCourse(course);
  },

  update: async ({ id, data }: { id: number; data: Partial<Course> }): Promise<Course> => {
    return await window.db.updateCourse(id, data);
  },

  delete: async (id: number): Promise<void> => {
    return await window.db.deleteCourse(id);
  },
};

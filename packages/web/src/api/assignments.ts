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

export const assignmentsApi = {
  getAll: async (year?: string, semester?: string, specialization?: string): Promise<Assignment[]> => {
    return await window.db.getAssignments(year, semester, specialization);
  },

  create: async (assignment: Assignment): Promise<Assignment> => {
    return await window.db.addAssignment(assignment);
  },

  update: async ({ id, data }: { id: number; data: Assignment }): Promise<Assignment> => {
    return await window.db.updateAssignment(id, data);
  },

  delete: async (id: number): Promise<void> => {
    return await window.db.deleteAssignment(id);
  },
};

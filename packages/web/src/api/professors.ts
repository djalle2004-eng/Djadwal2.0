export interface Professor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  academic_title?: string;
}

export const professorsApi = {
  getAll: async (): Promise<Professor[]> => {
    return await window.db.getProfessors();
  },

  getById: async (id: number): Promise<Professor | undefined> => {
    // Note: Assuming there is a getProfessorById method. If not, filter from getAll
    const professors = await window.db.getProfessors();
    return professors.find((p: Professor) => p.id === id);
  },

  create: async (professor: Partial<Professor>): Promise<Professor> => {
    return await window.db.addProfessor(professor);
  },

  update: async ({ id, data }: { id: number; data: Partial<Professor> }): Promise<Professor> => {
    return await window.db.updateProfessor(id, data);
  },

  delete: async (id: number): Promise<void> => {
    return await window.db.deleteProfessor(id);
  },

  deleteAll: async (): Promise<void> => {
    return await window.db.deleteAllProfessors();
  }
};

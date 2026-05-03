export interface Group {
  id: number;
  name: string;
  specialization?: string;
  year?: string;
  parent_group_id?: number;
  group_type?: string;
  department_id?: number;
}

export interface Department {
  id: number;
  name: string;
}

export const groupsApi = {
  getAll: async (): Promise<Group[]> => {
    return await window.db.getGroups();
  },

  getDepartments: async (): Promise<Department[]> => {
    return await window.db.getDepartments();
  },

  getById: async (id: number): Promise<Group | undefined> => {
    const groups = await window.db.getGroups();
    return groups.find((g: Group) => g.id === id);
  },

  create: async (groupName: string): Promise<Group> => {
    return await window.db.addGroup(groupName);
  },

  update: async ({ id, newName }: { id: number; newName: string }): Promise<void> => {
    return await window.db.updateGroup(id, newName);
  },

  delete: async (id: number): Promise<void> => {
    return await window.db.deleteGroup(id);
  },

  deleteAll: async (): Promise<void> => {
    // Note: Assuming there is a deleteAllGroups method
    if (window.db.deleteAllGroups) {
      return await window.db.deleteAllGroups();
    }
    throw new Error('Method deleteAllGroups not implemented in window.db');
  }
};

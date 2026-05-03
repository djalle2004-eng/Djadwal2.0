export interface Room {
  id: number;
  name: string;
  capacity?: number;
}

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    return await window.db.getRooms();
  },

  getById: async (id: number): Promise<Room | undefined> => {
    const rooms = await window.db.getRooms();
    return rooms.find((r: Room) => r.id === id);
  },

  create: async (room: Partial<Room>): Promise<Room> => {
    return await window.db.addRoom(room);
  },

  update: async ({ id, data }: { id: number; data: Partial<Room> }): Promise<Room> => {
    return await window.db.updateRoom(id, data);
  },

  delete: async (id: number): Promise<void> => {
    return await window.db.deleteRoom(id);
  },
};

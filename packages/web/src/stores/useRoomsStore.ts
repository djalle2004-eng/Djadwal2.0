import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Room {
  id: number;
  name: string;
  capacity: number;
}

interface RoomsState {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRooms: () => Promise<void>;
  addRoom: (room: Partial<Room>) => Promise<void>;
  updateRoom: (id: number, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: number) => Promise<void>;
}

export const useRoomsStore = create<RoomsState>()(
  devtools(
    immer((set) => ({
      rooms: [],
      isLoading: false,
      error: null,

      fetchRooms: async () => {
        set((state) => { state.isLoading = true; });
        try {
          const fetched = await window.db.getRooms();
          set((state) => {
            state.rooms = fetched;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },

      addRoom: async (room) => {
        try {
          const result = await window.db.addRoom(room);
          set((state) => {
            state.rooms.push(result);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      updateRoom: async (id, room) => {
        try {
          const result = await window.db.updateRoom(id, room);
          set((state) => {
            const idx = state.rooms.findIndex(r => r.id === id);
            if (idx !== -1) state.rooms[idx] = result;
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      },

      deleteRoom: async (id) => {
        try {
          await window.db.deleteRoom(id);
          set((state) => {
            state.rooms = state.rooms.filter(r => r.id !== id);
          });
        } catch (error: any) {
          set((state) => { state.error = error.message; });
          throw error;
        }
      }
    }))
  )
);

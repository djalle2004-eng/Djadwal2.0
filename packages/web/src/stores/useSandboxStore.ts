import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useScheduleStore, Assignment } from './useScheduleStore';

interface SandboxState {
  isSandboxMode: boolean;
  sandboxAssignments: Assignment[];
  hasChanges: boolean;
  history: Assignment[][];
  future: Assignment[][];

  // Actions
  enterSandboxMode: () => void;
  exitSandboxMode: () => void;
  addSandboxAssignment: (assignment: Assignment) => void;
  updateSandboxAssignment: (id: number, updatedAssignment: Assignment) => void;
  deleteSandboxAssignment: (id: number) => void;
  undo: () => void;
  redo: () => void;
  commitChanges: () => Promise<void>;
  discardChanges: () => void;
  saveDraft: (name: string) => Promise<number>;
  loadDraft: (id: number) => Promise<void>;
  reset: () => void;
}

export const useSandboxStore = create<SandboxState>()(
  devtools(
    immer((set, get) => ({
      isSandboxMode: false,
      sandboxAssignments: [],
      hasChanges: false,
      history: [],
      future: [],

      enterSandboxMode: () => {
        const { assignments } = useScheduleStore.getState();
        set((state) => {
          state.sandboxAssignments = JSON.parse(JSON.stringify(assignments));
          state.isSandboxMode = true;
          state.hasChanges = false;
          state.history = [];
          state.future = [];
        });
      },

      exitSandboxMode: () => {
        set((state) => {
          state.isSandboxMode = false;
          state.sandboxAssignments = [];
          state.hasChanges = false;
          state.history = [];
          state.future = [];
        });
      },

      addSandboxAssignment: (assignment) => {
        const { sandboxAssignments } = get();
        set((state) => {
          state.history.push(JSON.parse(JSON.stringify(sandboxAssignments)));
          state.future = [];
          const tempId = -Math.floor(Math.random() * 1000000);
          state.sandboxAssignments.push({ ...assignment, id: tempId });
          state.hasChanges = true;
        });
      },

      updateSandboxAssignment: (id, updatedAssignment) => {
        const { sandboxAssignments } = get();
        set((state) => {
          state.history.push(JSON.parse(JSON.stringify(sandboxAssignments)));
          state.future = [];
          const idx = state.sandboxAssignments.findIndex(a => a.id === id);
          if (idx !== -1) {
            state.sandboxAssignments[idx] = { ...updatedAssignment, id };
          }
          state.hasChanges = true;
        });
      },

      deleteSandboxAssignment: (id) => {
        const { sandboxAssignments } = get();
        set((state) => {
          state.history.push(JSON.parse(JSON.stringify(sandboxAssignments)));
          state.future = [];
          state.sandboxAssignments = state.sandboxAssignments.filter(a => a.id !== id);
          state.hasChanges = true;
        });
      },

      undo: () => {
        const { history, sandboxAssignments } = get();
        if (history.length === 0) return;

        set((state) => {
          const previousState = state.history.pop();
          if (previousState) {
            state.future.unshift(JSON.parse(JSON.stringify(sandboxAssignments)));
            state.sandboxAssignments = previousState;
            state.hasChanges = true;
          }
        });
      },

      redo: () => {
        const { future, sandboxAssignments } = get();
        if (future.length === 0) return;

        set((state) => {
          const nextState = state.future.shift();
          if (nextState) {
            state.history.push(JSON.parse(JSON.stringify(sandboxAssignments)));
            state.sandboxAssignments = nextState;
            state.hasChanges = true;
          }
        });
      },

      commitChanges: async () => {
        const { sandboxAssignments } = get();
        const { assignments, addAssignment, updateAssignment, deleteAssignment, fetchAssignments } = useScheduleStore.getState();

        try {
          const sandboxIds = new Set(sandboxAssignments.map(a => a.id));
          const deletedIds = assignments.filter(a => !sandboxIds.has(a.id)).map(a => a.id);
          const newAssignments = sandboxAssignments.filter(a => a.id && a.id < 0);
          const updatedAssignments = sandboxAssignments.filter(a => {
            if (!a.id || a.id < 0) return false;
            const original = assignments.find(orig => orig.id === a.id);
            return JSON.stringify(original) !== JSON.stringify(a);
          });

          for (const id of deletedIds) if (id) await deleteAssignment(id);
          for (const a of newAssignments) {
            const { id, ...rest } = a;
            await addAssignment(rest as Assignment);
          }
          for (const a of updatedAssignments) {
            if (a.id) await updateAssignment(a.id, a);
          }

          await fetchAssignments();
          get().exitSandboxMode();
        } catch (error) {
          console.error("Error committing changes:", error);
          throw error;
        }
      },

      discardChanges: () => {
        if (window.confirm('هل أنت متأكد من إلغاء جميع التغييرات؟')) {
          get().enterSandboxMode();
        }
      },

      saveDraft: async (name) => {
        const { sandboxAssignments } = get();
        return (await window.db.saveSandboxDraft(name, sandboxAssignments)).id;
      },

      loadDraft: async (id) => {
        const result = await window.db.loadSandboxDraft(id);
        if (!result) throw new Error('Draft not found');
        const draftData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        
        set((state) => {
          state.isSandboxMode = true;
          state.sandboxAssignments = draftData;
          state.hasChanges = true;
          state.history = [];
          state.future = [];
        });
      },

      reset: () => {
        set((state) => {
          state.isSandboxMode = false;
          state.sandboxAssignments = [];
          state.hasChanges = false;
          state.history = [];
          state.future = [];
        });
      }
    }))
  )
);

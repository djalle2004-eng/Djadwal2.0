// Workload is a derived state. We can either compute it here or in the backend.
// Since Djadwal uses a local DB and the computation is done in the frontend,
// we don't strictly need a dedicated API file, but we keep it for architecture consistency.
// The actual workload logic might be complex, so we export a simple interface.

export interface WorkloadSummary {
  professorId: number;
  totalHours: number;
  lectureCount: number;
  tdCount: number;
}

export const workloadApi = {
  // If window.db has a getWorkload method, we would use it here.
  // Otherwise, we'll compute it in the hook.
  getSummary: async (): Promise<WorkloadSummary[]> => {
    // Placeholder: implementation depends on how workload is calculated in ProfessorWorkload.tsx
    return [];
  }
};

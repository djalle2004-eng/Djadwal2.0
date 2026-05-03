export interface ExtraSession {
  id?: number;
  room_id: number;
  room_name?: string;
  professor_id: number;
  professor_name?: string;
  group_id: number;
  group_name?: string;
  course_id: number;
  course_name?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: 'extra' | 'makeup' | 'exam' | 'semester_exam';
  description?: string;
  exam_note?: string;
  is_archived?: number;
}

export const sessionsApi = {
  getExtraSessions: async (): Promise<ExtraSession[]> => {
    return await window.db.getExtraSessions();
  },

  createExtraSession: async (session: ExtraSession): Promise<ExtraSession> => {
    return await window.db.addExtraSession(session);
  },

  updateExtraSession: async ({ id, data }: { id: number; data: ExtraSession }): Promise<ExtraSession> => {
    return await window.db.updateExtraSession(id, data);
  },

  deleteExtraSession: async (id: number): Promise<void> => {
    return await window.db.deleteExtraSession(id);
  },

  archivePastSessions: async (): Promise<{ archived: number, error?: string }> => {
    return await window.db.archivePastSessions();
  }
};

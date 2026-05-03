export interface TimeSlot {
  id: number;
  label: string;
  start: string;
  end: string;
}

/**
 * Schedule API methods for retrieving time slots and other schedule metadata.
 */
export const scheduleApi = {
  /**
   * Fetches all available time slots for the schedule.
   * @returns {Promise<TimeSlot[]>} Array of time slots
   */
  getTimeSlots: async (): Promise<TimeSlot[]> => {
    return await window.db.getTimeSlots();
  }
};

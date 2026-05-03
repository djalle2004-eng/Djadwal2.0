import { CourseAssignment } from './types';

export class ConflictDetector {
  private professorBitmasks: Map<number, number[]>;
  private roomBitmasks: Map<number, number[]>;
  private groupBitmasks: Map<number, number[]>;
  private numDays = 7; // Saturday to Friday
  private numSlots = 8; // Max slots per day

  constructor() {
    this.professorBitmasks = new Map();
    this.roomBitmasks = new Map();
    this.groupBitmasks = new Map();
  }

  public reset() {
    this.professorBitmasks.clear();
    this.roomBitmasks.clear();
    this.groupBitmasks.clear();
  }

  private getBitmask(map: Map<number, number[]>, id: number): number[] {
    if (!map.has(id)) {
      map.set(id, new Array(this.numDays).fill(0));
    }
    return map.get(id)!;
  }

  public addAssignment(assignment: CourseAssignment, slotIndex: number): boolean {
    const { professor_id, room_id, group_id, day_of_week } = assignment;
    const bit = 1 << slotIndex;

    const profMasks = this.getBitmask(this.professorBitmasks, professor_id);
    const roomMasks = this.getBitmask(this.roomBitmasks, room_id);
    const groupMasks = this.getBitmask(this.groupBitmasks, group_id);

    // Check conflicts
    if ((profMasks[day_of_week] & bit) || 
        (roomMasks[day_of_week] & bit) || 
        (groupMasks[day_of_week] & bit)) {
      return false;
    }

    // Set bits
    profMasks[day_of_week] |= bit;
    roomMasks[day_of_week] |= bit;
    groupMasks[day_of_week] |= bit;

    return true;
  }

  public hasConflict(assignment: CourseAssignment, slotIndex: number): boolean {
    const { professor_id, room_id, group_id, day_of_week } = assignment;
    const bit = 1 << slotIndex;

    const profMasks = this.professorBitmasks.get(professor_id)?.[day_of_week] || 0;
    const roomMasks = this.roomBitmasks.get(room_id)?.[day_of_week] || 0;
    const groupMasks = this.groupBitmasks.get(group_id)?.[day_of_week] || 0;

    return !!((profMasks & bit) || (roomMasks & bit) || (groupMasks & bit));
  }
}

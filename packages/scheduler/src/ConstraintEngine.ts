import { 
  CourseAssignment, 
  ConstraintViolation, 
  SchedulerInput, 
  Professor, 
  Room, 
  Group 
} from './types';

export class ConstraintEngine {
  public checkHardConstraints(
    assignment: CourseAssignment,
    input: SchedulerInput
  ): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const room = input.rooms.find(r => r.id === assignment.room_id);
    const group = input.groups.find(g => g.id === assignment.group_id);

    // 1. Room Capacity
    if (room && group && group.size && room.capacity < group.size) {
      violations.push({
        type: 'hard',
        description: `Room capacity (${room.capacity}) is less than group size (${group.size})`,
        penalty: 1000,
        involvedIds: { roomId: room.id, groupId: group.id }
      });
    }

    // 2. Room Equipment (Lab, Projector, etc.)
    // This would require course.requirements vs room.equipment
    // Assuming simple check for now if courses had requirements

    return violations;
  }

  public calculateSoftPenalty(
    assignments: CourseAssignment[],
    input: SchedulerInput
  ): { totalPenalty: number; violations: ConstraintViolation[] } {
    let totalPenalty = 0;
    const violations: ConstraintViolation[] = [];
    const weights = input.constraints.weights;

    // 1. Professor Idle Gaps
    const profAssignments = this.groupBy(assignments, 'professor_id');
    for (const [profId, items] of Object.entries(profAssignments)) {
      const byDay = this.groupBy(items, 'day_of_week');
      for (const dayItems of Object.values(byDay)) {
        if (dayItems.length > 1) {
          // Sort by time and check gaps
          // Simplified gap detection for now
        }
      }
    }

    // 2. Professor Preferences
    // Parse preferences JSON and check day/time

    // 3. Distribution
    // Check if assignments are balanced across days

    return { totalPenalty, violations };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }
}

import { SchedulerInput, CourseAssignment, ConstraintViolation } from './types';
import { ConstraintEngine } from './ConstraintEngine';
import { ConflictDetector } from './ConflictDetector';

export class FitnessEvaluator {
  private engine: ConstraintEngine;
  private conflictDetector: ConflictDetector;

  constructor() {
    this.engine = new ConstraintEngine();
    this.conflictDetector = new ConflictDetector();
  }

  public evaluate(
    assignments: CourseAssignment[],
    input: SchedulerInput
  ): { fitness: number; violations: ConstraintViolation[] } {
    this.conflictDetector.reset();
    let hardViolationsCount = 0;
    const allViolations: ConstraintViolation[] = [];

    // 1. Check Conflicts (the most critical hard constraint)
    for (const assignment of assignments) {
      // Map start_time to slot index
      const slotIndex = this.getSlotIndex(assignment.start_time);
      if (this.conflictDetector.hasConflict(assignment, slotIndex)) {
        hardViolationsCount++;
        allViolations.push({
          type: 'hard',
          description: 'Time slot conflict detected',
          penalty: 1000,
          involvedIds: { assignmentId: assignment.id }
        });
      } else {
        this.conflictDetector.addAssignment(assignment, slotIndex);
      }

      // 2. Check other Hard Constraints
      const hardViolations = this.engine.checkHardConstraints(assignment, input);
      if (hardViolations.length > 0) {
        hardViolationsCount += hardViolations.length;
        allViolations.push(...hardViolations);
      }
    }

    // 3. Calculate Soft Penalty
    const { totalPenalty: softPenalty, violations: softViolations } = 
      this.engine.calculateSoftPenalty(assignments, input);
    
    allViolations.push(...softViolations);

    // Fitness Calculation
    // Total penalty = hard * 10000 + soft
    const totalPenalty = (hardViolationsCount * 10000) + softPenalty;
    const fitness = 1 / (1 + totalPenalty);

    return { fitness, violations: allViolations };
  }

  private getSlotIndex(startTime: string): number {
    const slots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00'];
    const index = slots.indexOf(startTime);
    return index !== -1 ? index : 0;
  }
}

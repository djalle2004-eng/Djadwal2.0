import { SchedulerInput, SchedulerResult } from './types';
import { GeneticAlgorithm } from './GeneticAlgorithm';

export async function generateSchedule(
  input: SchedulerInput,
  onProgress?: (gen: number, fitness: number) => void
): Promise<SchedulerResult> {
  const ga = new GeneticAlgorithm();
  return ga.run(input, onProgress);
}

// Export everything for convenience
export * from './types';
export * from './GeneticAlgorithm';
export * from './FitnessEvaluator';
export * from './ConflictDetector';
export * from './ConstraintEngine';

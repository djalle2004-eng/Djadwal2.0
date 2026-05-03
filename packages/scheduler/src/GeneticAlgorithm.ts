import { SchedulerInput, CourseAssignment, SchedulerResult } from './types';
import { FitnessEvaluator } from './FitnessEvaluator';

export class GeneticAlgorithm {
  private evaluator: FitnessEvaluator;
  private populationSize = 50;
  private maxGenerations = 500;
  private mutationRate = 0.1;
  private tournamentSize = 5;
  private elitismCount = 5;

  constructor() {
    this.evaluator = new FitnessEvaluator();
  }

  public async run(input: SchedulerInput, onProgress?: (gen: number, fitness: number) => void): Promise<SchedulerResult> {
    const startTime = Date.now();
    
    // 1. Initialize Population
    let population = this.initializePopulation(input);
    let bestResult: { fitness: number; assignments: CourseAssignment[] } | null = null;

    for (let gen = 0; gen < this.maxGenerations; gen++) {
      // 2. Evaluate
      const results = population.map(individual => ({
        assignments: individual,
        ...this.evaluator.evaluate(individual, input)
      }));

      // Sort by fitness
      results.sort((a, b) => b.fitness - a.fitness);
      
      if (!bestResult || results[0].fitness > bestResult.fitness) {
        bestResult = { fitness: results[0].fitness, assignments: results[0].assignments };
      }

      if (onProgress) onProgress(gen, results[0].fitness);

      // Check termination
      if (results[0].fitness > 0.95) break;

      // 3. New Generation
      const newPopulation: CourseAssignment[][] = [];

      // Elitism
      for (let i = 0; i < this.elitismCount; i++) {
        newPopulation.push(results[i].assignments);
      }

      // Selection, Crossover, Mutation
      while (newPopulation.length < this.populationSize) {
        const parent1 = this.tournamentSelect(results);
        const parent2 = this.tournamentSelect(results);
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child, input);
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    const finalEvaluation = this.evaluator.evaluate(bestResult!.assignments, input);

    return {
      sessions: bestResult!.assignments,
      fitnessScore: finalEvaluation.fitness,
      constraintViolations: finalEvaluation.violations,
      generationCount: this.maxGenerations,
      executionTimeMs: Date.now() - startTime,
      warnings: []
    };
  }

  private initializePopulation(input: SchedulerInput): CourseAssignment[][] {
    const population: CourseAssignment[][] = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.createRandomSchedule(input));
    }
    return population;
  }

  private createRandomSchedule(input: SchedulerInput): CourseAssignment[] {
    // Generate random assignments based on input.assignments template
    return input.assignments.map(a => ({
      ...a,
      day_of_week: Math.floor(Math.random() * 6),
      start_time: ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'][Math.floor(Math.random() * 6)],
      room_id: input.rooms[Math.floor(Math.random() * input.rooms.length)].id
    }));
  }

  private tournamentSelect(results: any[]): CourseAssignment[] {
    let best = results[Math.floor(Math.random() * results.length)];
    for (let i = 0; i < this.tournamentSize; i++) {
      const challenger = results[Math.floor(Math.random() * results.length)];
      if (challenger.fitness > best.fitness) best = challenger;
    }
    return best.assignments;
  }

  private crossover(p1: CourseAssignment[], p2: CourseAssignment[]): CourseAssignment[] {
    return p1.map((gene, i) => Math.random() > 0.5 ? gene : p2[i]);
  }

  private mutate(individual: CourseAssignment[], input: SchedulerInput): CourseAssignment[] {
    return individual.map(gene => {
      if (Math.random() < this.mutationRate) {
        return {
          ...gene,
          day_of_week: Math.floor(Math.random() * 6),
          start_time: ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'][Math.floor(Math.random() * 6)],
          room_id: input.rooms[Math.floor(Math.random() * input.rooms.length)].id
        };
      }
      return gene;
    });
  }
}

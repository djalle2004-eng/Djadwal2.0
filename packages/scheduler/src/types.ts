export interface Professor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  academic_title?: string;
  preferences?: string; // JSON string
}

export interface Course {
  id: number;
  name: string;
  code?: string;
  hours?: number;
  group_size?: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  equipment?: string[];
}

export interface Group {
  id: number;
  name: string;
  size?: number;
  specialization?: string;
}

export interface AcademicYear {
  id: number;
  year_name: string;
}

export interface Semester {
  id: number;
  semester_name: string;
}

export interface CourseAssignment {
  id: number;
  professor_id: number;
  course_id: number;
  group_id: number;
  room_id: number;
  day_of_week: number; // 0-6
  start_time: string; // "HH:MM"
  end_time: string;
  academic_year: string;
  semester: string;
}

export interface GeneratedSession extends CourseAssignment {
  professor_name?: string;
  course_name?: string;
  group_name?: string;
  room_name?: string;
}

export interface ConstraintViolation {
  type: 'hard' | 'soft';
  description: string;
  penalty: number;
  involvedIds: {
    professorId?: number;
    roomId?: number;
    groupId?: number;
    assignmentId?: number;
  };
}

export interface SchedulerConstraints {
  weights: {
    professorPreferences: number;
    idleGaps: number;
    commuteTime: number;
    distribution: number;
    afternoonSessions: number;
    roomChanges: number;
  };
}

export interface SchedulerInput {
  professors: Professor[];
  courses: Course[];
  rooms: Room[];
  groups: Group[];
  assignments: CourseAssignment[];
  academicYear: AcademicYear;
  semester: Semester;
  constraints: SchedulerConstraints;
}

export interface SchedulerResult {
  sessions: GeneratedSession[];
  fitnessScore: number;
  constraintViolations: ConstraintViolation[];
  generationCount: number;
  executionTimeMs: number;
  warnings: string[];
}

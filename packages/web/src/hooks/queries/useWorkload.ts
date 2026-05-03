import { useQuery } from '@tanstack/react-query';
import { useAssignments } from './useAssignments';
import { useProfessors } from './useProfessors';
import { useCourses } from './useCourses';
import { useGroups } from './useGroups';

export const WORKLOAD_QUERY_KEY = ['workload'];

export const useWorkload = (year?: string, semester?: string) => {
  // Workload is derived from assignments, professors, courses, and groups
  const { data: assignments = [], isLoading: isLoadingAssignments } = useAssignments(year, semester);
  const { data: professors = [], isLoading: isLoadingProfessors } = useProfessors();
  const { data: courses = [], isLoading: isLoadingCourses } = useCourses();
  const { data: groups = [], isLoading: isLoadingGroups } = useGroups();

  return useQuery({
    queryKey: [...WORKLOAD_QUERY_KEY, year, semester],
    queryFn: () => {
      // Basic computation logic mirroring ProfessorWorkload.tsx
      const workloadMap = new Map();

      professors.forEach(prof => {
        workloadMap.set(prof.id, {
          professor: prof,
          courses: [],
          totalHours: 0,
          totalLectureHours: 0,
          totalTDHours: 0,
          days: {}
        });
      });

      assignments.forEach(assignment => {
        const prof = workloadMap.get(assignment.professor_id);
        if (prof) {
          // This is a simplified calculation. Real logic requires time difference calculation.
          // Assuming each slot is 1.5 hours
          const hours = 1.5; 
          prof.totalHours += hours;

          const group = groups.find(g => g.id === assignment.group_id);
          const isLecture = group?.name?.includes('محاضرة') || group?.group_type === 'lecture_group';

          if (isLecture) {
            prof.totalLectureHours += hours;
          } else {
            prof.totalTDHours += hours;
          }
        }
      });

      return Array.from(workloadMap.values());
    },
    // Only compute when all dependencies are loaded
    enabled: !isLoadingAssignments && !isLoadingProfessors && !isLoadingCourses && !isLoadingGroups,
  });
};

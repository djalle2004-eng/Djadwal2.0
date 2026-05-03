import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as academicYearService from '../../services/academicYearService';
import { useAcademicStore } from '../../stores/useAcademicStore';
import { AcademicYear, Semester, ImportOptions } from '../../types/academicYear';

export const academicKeys = {
  all: ['academic'] as const,
  years: () => [...academicKeys.all, 'years'] as const,
  semesters: (yearId: number) => [...academicKeys.all, 'semesters', yearId] as const,
};

export function useAcademicYears() {
  return useQuery({
    queryKey: academicKeys.years(),
    queryFn: academicYearService.getAcademicYears,
  });
}

export function useSemesters(yearId: number | null) {
  return useQuery({
    queryKey: academicKeys.semesters(yearId || 0),
    queryFn: () => (yearId ? academicYearService.getSemesters(yearId) : Promise.resolve([])),
    enabled: !!yearId,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (yearName: string) => academicYearService.addAcademicYear(yearName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.years() });
    },
  });
}

export function useSetActiveAcademicYear() {
  const queryClient = useQueryClient();
  const { setCurrentYear } = useAcademicStore();
  
  return useMutation({
    mutationFn: (yearId: number) => academicYearService.setActiveAcademicYear(yearId),
    onSuccess: async (_, yearId) => {
      // Find the year object to update Zustand
      const years = queryClient.getQueryData<AcademicYear[]>(academicKeys.years());
      const year = years?.find(y => y.id === yearId);
      if (year) {
        setCurrentYear(year);
      }
      queryClient.invalidateQueries({ queryKey: academicKeys.years() });
    },
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ yearId, name, startDate, endDate }: { yearId: number; name: string; startDate: string; endDate: string }) =>
      academicYearService.addSemester(yearId, name, startDate, endDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.semesters(variables.yearId) });
    },
  });
}

export function useUpdateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, startDate, endDate, isPublic }: { id: number; name: string; startDate: string; endDate: string; isPublic?: boolean }) =>
      academicYearService.updateSemester(id, name, startDate, endDate, isPublic),
    onSuccess: (updatedSemester) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.semesters(updatedSemester.academic_year_id) });
    },
  });
}

export function useSetActiveSemester() {
  const queryClient = useQueryClient();
  const { currentYear, setCurrentSemester } = useAcademicStore();
  
  return useMutation({
    mutationFn: (semesterId: number) => academicYearService.setActiveSemester(semesterId),
    onSuccess: async (_, semesterId) => {
      if (currentYear) {
        // Find the semester object to update Zustand
        const semesters = queryClient.getQueryData<Semester[]>(academicKeys.semesters(currentYear.id));
        const semester = semesters?.find(s => s.id === semesterId);
        if (semester) {
          setCurrentSemester(semester);
        }
        queryClient.invalidateQueries({ queryKey: academicKeys.semesters(currentYear.id) });
      }
    },
  });
}

export function useImportAcademicData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceYearId, targetYearId, options }: { sourceYearId: number; targetYearId: number; options: ImportOptions }) =>
      academicYearService.importDataFromPreviousYear(sourceYearId, targetYearId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.all });
    },
  });
}

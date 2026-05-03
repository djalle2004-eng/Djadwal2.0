import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, Course } from '../../api/courses';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const COURSES_QUERY_KEY = ['courses'];

export const useCourses = () => {
  return useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: coursesApi.getAll,
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, id],
    queryFn: () => coursesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: coursesApi.create,
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({ queryKey: COURSES_QUERY_KEY });
      const previousCourses = queryClient.getQueryData<Course[]>(COURSES_QUERY_KEY);

      if (previousCourses) {
        queryClient.setQueryData<Course[]>(COURSES_QUERY_KEY, [
          ...previousCourses,
          { id: Math.random(), ...newCourse } as Course,
        ]);
      }
      return { previousCourses };
    },
    onError: (err, newCourse, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(COURSES_QUERY_KEY, context.previousCourses);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم إضافة المقرر بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: coursesApi.update,
    onMutate: async (updatedCourse) => {
      await queryClient.cancelQueries({ queryKey: COURSES_QUERY_KEY });
      const previousCourses = queryClient.getQueryData<Course[]>(COURSES_QUERY_KEY);

      if (previousCourses) {
        queryClient.setQueryData<Course[]>(COURSES_QUERY_KEY, 
          previousCourses.map(c => c.id === updatedCourse.id ? { ...c, ...updatedCourse.data } : c)
        );
      }
      return { previousCourses };
    },
    onError: (err, newCourse, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(COURSES_QUERY_KEY, context.previousCourses);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم تحديث المقرر بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: coursesApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: COURSES_QUERY_KEY });
      const previousCourses = queryClient.getQueryData<Course[]>(COURSES_QUERY_KEY);

      if (previousCourses) {
        queryClient.setQueryData<Course[]>(COURSES_QUERY_KEY, 
          previousCourses.filter(c => c.id !== id)
        );
      }
      return { previousCourses };
    },
    onError: (err, id, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(COURSES_QUERY_KEY, context.previousCourses);
      }
    },
    onSuccess: () => {
      addNotification({ type: 'success', message: 'تم حذف المقرر بنجاح' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
  });
};

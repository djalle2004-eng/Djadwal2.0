import { useAuthStore, useIsAdmin, useIsProfessor, useIsScheduleManager, usePermissions as useStorePermissions } from '../stores/useAuthStore';

/**
 * خطاف للتحقق من الصلاحيات
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useIsAdmin();
  const isProfessor = useIsProfessor();
  const isScheduleManager = useIsScheduleManager();
  const hasPermission = useStorePermissions();
  const isStaff = user?.role === 'staff';
  
  /**
   * التحقق من صلاحية معينة
   */
  const can = (action: 'view' | 'create' | 'update' | 'delete', resource: string): boolean => {
    return hasPermission(action, resource);
  };
  
  /**
   * التحقق من عدة صلاحيات
   */
  const canAny = (actions: Array<{ action: 'view' | 'create' | 'update' | 'delete'; resource: string }>): boolean => {
    return actions.some(({ action, resource }) => can(action, resource));
  };
  
  /**
   * التحقق من كل الصلاحيات
   */
  const canAll = (actions: Array<{ action: 'view' | 'create' | 'update' | 'delete'; resource: string }>): boolean => {
    return actions.every(({ action, resource }) => can(action, resource));
  };
  
  return {
    user,
    can,
    canAny,
    canAll,
    isAdmin,
    isScheduleManager,
    isStaff,
    isProfessor
  };
};
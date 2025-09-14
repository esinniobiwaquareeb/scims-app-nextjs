import { useAuth } from '@/contexts/AuthContext';
import { checkDemoRestrictions, getDemoRestrictionMessage } from '@/utils/demoRestrictions';

export function useDemoRestrictions() {
  const { user } = useAuth();

  const isDemoUser = user?.isDemo === true;

  const canPerformAction = (action: string): boolean => {
    const restriction = checkDemoRestrictions(user, action);
    return restriction.allowed;
  };

  const getRestrictionMessage = (action: string): string => {
    return getDemoRestrictionMessage(action);
  };

  const showDemoWarning = (action: string): boolean => {
    return isDemoUser && !canPerformAction(action);
  };

  return {
    isDemoUser,
    canPerformAction,
    getRestrictionMessage,
    showDemoWarning
  };
}

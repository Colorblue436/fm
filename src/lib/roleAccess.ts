import { AppView } from '@/types';
import type { UserRole } from '@/hooks/useUserRole';

const PET_PARENT_VIEWS = new Set([
  AppView.HOME, AppView.PETS, AppView.REMINDERS,
  AppView.NEARBY, AppView.ASSISTANT, AppView.PROFILE, AppView.SETTINGS,
]);

const VISITOR_VIEWS = new Set([
  AppView.COMMUNITY, AppView.DROPS, AppView.GROUPS,
  AppView.SCRATCH_BOARD, AppView.PROFILE, AppView.SETTINGS,
]);

const BOTH_VIEWS = new Set([
  AppView.HOME, AppView.PETS, AppView.REMINDERS,
  AppView.NEARBY, AppView.ASSISTANT,
  AppView.COMMUNITY, AppView.DROPS, AppView.GROUPS,
  AppView.SCRATCH_BOARD, AppView.PROFILE, AppView.SETTINGS,
]);

export function getAllowedViews(role: UserRole): Set<AppView> {
  switch (role) {
    case 'pet_parent': return PET_PARENT_VIEWS;
    case 'visitor': return VISITOR_VIEWS;
    case 'both': return BOTH_VIEWS;
    default: return BOTH_VIEWS;
  }
}

export function getDefaultView(role: UserRole): AppView {
  switch (role) {
    case 'pet_parent': return AppView.HOME;
    case 'visitor': return AppView.COMMUNITY;
    case 'both': return AppView.HOME;
    default: return AppView.HOME;
  }
}

import type { TaskCategory } from './taskEngine';

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  countByCategory: Partial<Record<TaskCategory, number>>;
}

export const BADGES: BadgeDef[] = [
  { key: 'first_step',  name: 'First Step',     description: 'Complete your first task',         icon: '🌱', check: c => c.totalCompletions >= 1 },
  { key: 'walker',      name: 'Walker',         description: 'Complete 5 walks',                  icon: '🦮', check: c => (c.countByCategory.walk ?? 0) >= 5 },
  { key: 'chef',        name: 'Pet Chef',       description: 'Feed your pet 20 times',            icon: '🍽️', check: c => (c.countByCategory.feeding ?? 0) >= 20 },
  { key: 'hydration',   name: 'Hydration Hero', description: 'Refill water 10 times',             icon: '💧', check: c => (c.countByCategory.hydration ?? 0) >= 10 },
  { key: 'streak_3',    name: 'On a Roll',      description: '3-day streak',                      icon: '🔥', check: c => c.currentStreak >= 3 },
  { key: 'streak_7',    name: 'Week Warrior',   description: '7-day streak',                      icon: '⭐', check: c => c.currentStreak >= 7 },
  { key: 'streak_30',   name: 'Devoted',        description: '30-day streak',                     icon: '🏆', check: c => c.longestStreak >= 30 },
  { key: 'level_5',     name: 'Rising Star',    description: 'Reach level 5',                     icon: '✨', check: c => c.level >= 5 },
  { key: 'level_10',    name: 'Familiar Master',description: 'Reach level 10',                    icon: '👑', check: c => c.level >= 10 },
  { key: 'groomer',     name: 'Groomer',        description: 'Groom 5 times',                     icon: '✂️', check: c => (c.countByCategory.grooming ?? 0) >= 5 },
];

export function newlyEarned(ctx: AchievementContext, alreadyEarned: Set<string>): BadgeDef[] {
  return BADGES.filter(b => b.check(ctx) && !alreadyEarned.has(b.key));
}

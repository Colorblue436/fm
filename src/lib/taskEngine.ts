import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_XP, happinessDelta, healthDelta, levelFromXp, deriveMood } from './gamification';

export type TaskCategory =
  | 'feeding' | 'walk' | 'medicine' | 'grooming'
  | 'hydration' | 'litter' | 'play' | 'training' | 'other';

export interface PetTask {
  id: string;
  user_id: string;
  pet_id: string;
  category: TaskCategory;
  title: string;
  description?: string | null;
  xp_reward: number;
  recurrence: 'daily' | 'weekly' | 'custom';
  time_of_day?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  pet_id: string;
  xp_earned: number;
  completed_at: string;
}

export interface DefaultTaskSeed {
  category: TaskCategory;
  title: string;
  time_of_day?: string;
  recurrence?: 'daily' | 'weekly';
}

export const DEFAULT_TASKS: Record<string, DefaultTaskSeed[]> = {
  Dog: [
    { category: 'feeding', title: 'Morning meal', time_of_day: '08:00' },
    { category: 'feeding', title: 'Evening meal', time_of_day: '18:00' },
    { category: 'walk', title: 'Daily walk', time_of_day: '17:00' },
    { category: 'hydration', title: 'Refill water', time_of_day: '09:00' },
    { category: 'play', title: 'Playtime', time_of_day: '19:00' },
    { category: 'grooming', title: 'Brush coat', recurrence: 'weekly' },
  ],
  Cat: [
    { category: 'feeding', title: 'Morning meal', time_of_day: '08:00' },
    { category: 'feeding', title: 'Evening meal', time_of_day: '18:00' },
    { category: 'litter', title: 'Clean litter box', time_of_day: '20:00' },
    { category: 'hydration', title: 'Refill water', time_of_day: '09:00' },
    { category: 'play', title: 'Play session', time_of_day: '19:00' },
    { category: 'grooming', title: 'Brush coat', recurrence: 'weekly' },
  ],
  Bird: [
    { category: 'feeding', title: 'Refill seeds', time_of_day: '08:00' },
    { category: 'hydration', title: 'Fresh water', time_of_day: '08:00' },
    { category: 'litter', title: 'Clean cage', recurrence: 'weekly' },
  ],
  Fish: [
    { category: 'feeding', title: 'Feed fish', time_of_day: '09:00' },
    { category: 'litter', title: 'Check tank', recurrence: 'weekly' },
  ],
  Reptile: [
    { category: 'feeding', title: 'Feed', time_of_day: '12:00' },
    { category: 'hydration', title: 'Mist enclosure', time_of_day: '08:00' },
  ],
  Other: [
    { category: 'feeding', title: 'Feed', time_of_day: '08:00' },
    { category: 'hydration', title: 'Fresh water', time_of_day: '09:00' },
  ],
};

export async function ensureDefaultTasks(userId: string, petId: string, petType: string) {
  const { data: existing } = await supabase
    .from('pet_tasks')
    .select('id')
    .eq('pet_id', petId)
    .limit(1);
  if (existing && existing.length > 0) return;

  const seeds = DEFAULT_TASKS[petType] ?? DEFAULT_TASKS.Other;
  const rows = seeds.map(s => ({
    user_id: userId,
    pet_id: petId,
    category: s.category,
    title: s.title,
    xp_reward: CATEGORY_XP[s.category],
    recurrence: s.recurrence ?? 'daily' as const,
    time_of_day: s.time_of_day ?? null,
    is_active: true,
  }));
  await supabase.from('pet_tasks').insert(rows);
}

export function isTaskDueToday(task: PetTask, completionsToday: TaskCompletion[]): boolean {
  if (!task.is_active) return false;
  if (task.recurrence === 'daily') return true;
  if (task.recurrence === 'weekly') {
    // due if no completion in last 7 days
    const week = Date.now() - 7 * 24 * 3600 * 1000;
    return !completionsToday.some(c => c.task_id === task.id && new Date(c.completed_at).getTime() > week);
  }
  return true;
}

export async function completeTask(task: PetTask): Promise<{ leveledUp: boolean; newLevel: number; xpEarned: number }> {
  const xp = task.xp_reward;
  // Insert completion
  await supabase.from('task_completions').insert({
    user_id: task.user_id,
    task_id: task.id,
    pet_id: task.pet_id,
    xp_earned: xp,
  });

  // Update pet stats
  const { data: stats } = await supabase
    .from('pet_stats')
    .select('*')
    .eq('pet_id', task.pet_id)
    .maybeSingle();

  if (!stats) return { leveledUp: false, newLevel: 1, xpEarned: xp };

  const oldLevel = stats.level;
  const newXp = stats.xp + xp;
  const { level } = levelFromXp(newXp);
  const happiness = Math.min(100, stats.happiness + happinessDelta(task.category));
  const health = Math.min(100, stats.health_score + healthDelta(task.category));
  const mood = deriveMood({ happiness, health });

  await supabase
    .from('pet_stats')
    .update({
      xp: newXp,
      level,
      happiness,
      health_score: health,
      mood,
      last_activity_at: new Date().toISOString(),
    })
    .eq('pet_id', task.pet_id);

  return { leveledUp: level > oldLevel, newLevel: level, xpEarned: xp };
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

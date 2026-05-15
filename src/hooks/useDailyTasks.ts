import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ensureDefaultTasks, isTaskDueToday, startOfToday, type PetTask, type TaskCompletion } from '@/lib/taskEngine';

export interface DailyTask extends PetTask {
  completed: boolean;
  completion?: TaskCompletion;
}

export function useDailyTasks(userId?: string, petId?: string, petType?: string) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId || !petId) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    if (petType) await ensureDefaultTasks(userId, petId, petType);

    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from('pet_tasks').select('*').eq('pet_id', petId).eq('is_active', true),
      supabase.from('task_completions').select('*').eq('pet_id', petId).gte('completed_at', startOfToday().toISOString()),
    ]);

    const completions = (c ?? []) as TaskCompletion[];
    const completionsByTask = new Map(completions.map(x => [x.task_id, x]));
    const allTasks = (t ?? []) as PetTask[];

    const due = allTasks
      .filter(task => isTaskDueToday(task, completions))
      .map(task => ({
        ...task,
        completed: completionsByTask.has(task.id),
        completion: completionsByTask.get(task.id),
      }));

    setTasks(due);
    setLoading(false);
  }, [userId, petId, petType]);

  useEffect(() => { load(); }, [load]);

  return { tasks, loading, reload: load };
}

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calcStreak, levelFromXp } from '@/lib/gamification';
import { BADGES, newlyEarned, type AchievementContext } from '@/lib/achievements';
import type { TaskCategory } from '@/lib/taskEngine';

export interface UserGamification {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  countByCategory: Partial<Record<TaskCategory, number>>;
  earnedBadges: Set<string>;
}

export function useGamification(userId?: string) {
  const [data, setData] = useState<UserGamification | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setData(null); setLoading(false); return; }
    setLoading(true);

    const [{ data: stats }, { data: completions }, { data: achievements }] = await Promise.all([
      supabase.from('pet_stats').select('xp, current_streak, longest_streak').eq('user_id', userId),
      supabase.from('task_completions').select('completed_at, task_id').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1000),
      supabase.from('user_achievements').select('badge_key').eq('user_id', userId),
    ]);

    const totalXp = (stats ?? []).reduce((s, r) => s + (r.xp ?? 0), 0);
    const lvl = levelFromXp(totalXp);
    const dates = (completions ?? []).map(c => new Date(c.completed_at));
    const currentStreak = calcStreak(dates);
    const longestStreak = Math.max(currentStreak, ...((stats ?? []).map(s => s.longest_streak ?? 0)));

    // category counts via task lookup
    const taskIds = Array.from(new Set((completions ?? []).map(c => c.task_id)));
    let countByCategory: Partial<Record<TaskCategory, number>> = {};
    if (taskIds.length > 0) {
      const { data: tasks } = await supabase.from('pet_tasks').select('id, category').in('id', taskIds);
      const cat = new Map((tasks ?? []).map(t => [t.id, t.category as TaskCategory]));
      for (const c of completions ?? []) {
        const k = cat.get(c.task_id);
        if (k) countByCategory[k] = (countByCategory[k] ?? 0) + 1;
      }
    }

    const earnedBadges = new Set((achievements ?? []).map(a => a.badge_key));

    const ctx: AchievementContext = {
      totalCompletions: completions?.length ?? 0,
      currentStreak,
      longestStreak,
      totalXp,
      level: lvl.level,
      countByCategory,
    };

    // Persist newly earned badges
    const fresh = newlyEarned(ctx, earnedBadges);
    if (fresh.length > 0) {
      await supabase.from('user_achievements').insert(fresh.map(b => ({ user_id: userId, badge_key: b.key })));
      fresh.forEach(b => earnedBadges.add(b.key));
    }

    setData({
      totalXp,
      level: lvl.level,
      xpInLevel: lvl.xpInLevel,
      xpToNext: lvl.xpToNext,
      progress: lvl.progress,
      currentStreak,
      longestStreak,
      totalCompletions: completions?.length ?? 0,
      countByCategory,
      earnedBadges,
    });
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, reload: load, allBadges: BADGES };
}

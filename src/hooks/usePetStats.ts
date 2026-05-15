import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Mood } from '@/lib/gamification';

export interface PetStats {
  pet_id: string;
  user_id: string;
  happiness: number;
  health_score: number;
  mood: Mood;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
}

export function usePetStats(petId?: string) {
  const [stats, setStats] = useState<PetStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!petId) { setStats(null); setLoading(false); return; }
    const { data } = await supabase.from('pet_stats').select('*').eq('pet_id', petId).maybeSingle();
    if (data) setStats(data as PetStats);
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    refresh();
    if (!petId) return;
    const channel = supabase
      .channel(`pet_stats_${petId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pet_stats', filter: `pet_id=eq.${petId}` },
        () => refresh()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [petId, refresh]);

  return { stats, loading, refresh };
}

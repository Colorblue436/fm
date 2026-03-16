import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'visitor' | 'pet_parent' | 'both' | null;

export function useUserRole(userId: string | undefined) {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setRole((data?.role as UserRole) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  const updateRole = async (newRole: 'visitor' | 'pet_parent' | 'both') => {
    if (!userId) return;
    // Upsert: delete existing then insert
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('user_roles').insert({ user_id: userId, role: newRole as any });
    // Also update profiles.user_mode for backwards compat
    await supabase.from('profiles').update({ user_mode: newRole }).eq('user_id', userId);
    setRole(newRole);
  };

  return { role, loading, updateRole, refetch: fetchRole };
}

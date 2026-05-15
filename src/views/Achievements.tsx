import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakFlame } from '@/components/gamification/StreakFlame';

export const Achievements: React.FC = () => {
  const [userId, setUserId] = useState<string>();
  useEffect(() => { supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id)); }, []);
  const { data: gam } = useGamification(userId);

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-familiar-500" /> Achievements</h1>
        <p className="text-sm text-muted-foreground">Earn badges by caring for your pets daily.</p>
      </header>

      {gam && (
        <div className="rounded-3xl glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total XP</p>
              <p className="text-3xl font-bold tabular-nums">{gam.totalXp}</p>
            </div>
            <StreakFlame days={gam.currentStreak} />
          </div>
          <XPBar level={gam.level} xpInLevel={gam.xpInLevel} xpToNext={gam.xpToNext} progress={gam.progress} />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-muted/40 p-2"><p className="font-bold text-base">{gam.totalCompletions}</p><p className="text-muted-foreground">tasks</p></div>
            <div className="rounded-xl bg-muted/40 p-2"><p className="font-bold text-base">{gam.longestStreak}</p><p className="text-muted-foreground">best streak</p></div>
            <div className="rounded-xl bg-muted/40 p-2"><p className="font-bold text-base">{gam.earnedBadges.size}</p><p className="text-muted-foreground">badges</p></div>
          </div>
        </div>
      )}

      <BadgeGrid earned={gam?.earnedBadges ?? new Set()} />
    </div>
  );
};

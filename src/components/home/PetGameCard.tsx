import React from 'react';
import { motion } from 'framer-motion';
import { MoodBubble } from '@/components/gamification/MoodBubble';
import { StatMeter } from '@/components/gamification/StatMeter';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakFlame } from '@/components/gamification/StreakFlame';
import { TaskCard } from '@/components/gamification/TaskCard';
import { Heart, ShieldPlus, ListChecks, ChevronRight } from 'lucide-react';
import { usePetStats } from '@/hooks/usePetStats';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useGamification } from '@/hooks/useGamification';

interface Props {
  userId?: string;
  petId?: string;
  petType?: string;
  petName?: string;
  onOpenTasks?: () => void;
}

export const PetGameCard: React.FC<Props> = ({ userId, petId, petType, petName, onOpenTasks }) => {
  const { stats } = usePetStats(petId);
  const { tasks, reload } = useDailyTasks(userId, petId, petType);
  const { data: gam, reload: reloadGam } = useGamification(userId);

  if (!stats) return null;

  const remaining = tasks.filter(t => !t.completed);
  const done = tasks.length - remaining.length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl glass p-5 space-y-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <MoodBubble mood={stats.mood} />
        <div className="flex items-center gap-2">
          <StreakFlame days={gam?.currentStreak ?? stats.current_streak} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatMeter value={stats.happiness} label="Happiness" icon={<Heart size={12} className="text-pink-500" />} variant="happiness" />
        <StatMeter value={stats.health_score} label="Health" icon={<ShieldPlus size={12} className="text-emerald-500" />} variant="health" />
      </div>

      <XPBar
        level={gam?.level ?? stats.level}
        xpInLevel={gam?.xpInLevel ?? 0}
        xpToNext={gam?.xpToNext ?? 50}
        progress={gam?.progress ?? 0}
      />

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ListChecks size={15} className="text-familiar-500" />
            Today's care · {done}/{tasks.length}
          </h3>
          <button onClick={onOpenTasks} className="text-xs text-familiar-600 hover:text-familiar-700 font-medium flex items-center gap-0.5">
            All tasks <ChevronRight size={13} />
          </button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3">No tasks yet — they'll appear once you add this pet's routine.</p>
        ) : (
          <>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-xp transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-2">
              {(remaining.length ? remaining : tasks).slice(0, 3).map(t => (
                <TaskCard key={t.id} task={t} onComplete={() => { reload(); reloadGam(); }} />
              ))}
            </div>
          </>
        )}
      </div>

      {petName && (
        <p className="text-[11px] text-muted-foreground text-center">
          Caring for <span className="font-medium text-foreground">{petName}</span>
        </p>
      )}
    </motion.div>
  );
};

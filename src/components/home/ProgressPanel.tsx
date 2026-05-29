import React from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, ShieldCheck, ChevronRight, Trophy, Award } from 'lucide-react';

interface Props {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  tasksDone: number;
  streak: number;
  healthScore: number;
  badgesEarned?: number;
  onViewProfile: () => void;
}

export const ProgressPanel: React.FC<Props> = ({
  level, xpInLevel, xpToNext, tasksDone, streak, healthScore, badgesEarned = 0, onViewProfile,
}) => {
  const pct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  return (
    <motion.section
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-card border border-border/70 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Your progress</h3>
        <button onClick={onViewProfile} className="text-xs font-semibold text-familiar-600 hover:text-familiar-700 flex items-center gap-0.5">
          View profile <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Level {level}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{xpInLevel} / {xpToNext} XP</p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center"><Trophy size={14} className="text-amber-600" /></div>
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center"><Award size={14} className="text-violet-600" /></div>
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-familiar-500 to-familiar-700"
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-5">
        <Stat icon={Star} tone="text-rose-500" bg="bg-rose-50" label="Tasks done" value={String(tasksDone)} />
        <Stat icon={Flame} tone="text-orange-500" bg="bg-orange-50" label="Streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} />
        <Stat icon={ShieldCheck} tone="text-emerald-500" bg="bg-emerald-50" label="Health score" value={`${healthScore}%`} />
      </div>
    </motion.section>
  );
};

const Stat: React.FC<{ icon: React.ElementType; tone: string; bg: string; label: string; value: string }> = ({ icon: Icon, tone, bg, label, value }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-2.5">
    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-1.5`}>
      <Icon size={14} className={tone} />
    </div>
    <p className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</p>
    <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{value}</p>
  </div>
);

import React from 'react';
import { motion } from 'framer-motion';
import { Dog, Cat, Flame, Pencil, ChevronDown } from 'lucide-react';
import { MOOD_META, type Mood } from '@/lib/gamification';

interface Props {
  name: string;
  type?: string;
  avatarUrl?: string;
  mood: Mood;
  streak: number;
  bestStreak: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  onEditName?: () => void;
  onChangeMood?: () => void;
}

export const HeroPetCard: React.FC<Props> = ({
  name, type, avatarUrl, mood, streak, bestStreak, level,
  xpInLevel, xpToNext, onEditName, onChangeMood,
}) => {
  const meta = MOOD_META[mood];
  const Fallback = type?.toLowerCase() === 'cat' ? Cat : Dog;
  const pct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden p-4 sm:p-6 md:p-7 min-h-[200px] sm:min-h-[260px] md:min-h-[280px] shadow-lg shadow-familiar-500/5 border border-white/40"
      style={{
        background: `
          radial-gradient(120% 90% at 80% 10%, hsl(var(--familiar-200) / 0.55), transparent 55%),
          radial-gradient(80% 70% at 10% 90%, hsl(var(--mood-${mood.replace('mood-','')}) / 0.25), transparent 60%),
          linear-gradient(140deg, hsl(var(--familiar-50)), hsl(var(--familiar-100) / 0.6))
        `,
      }}
    >
      {/* Sparkles bg */}
      <div className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 1.5px), radial-gradient(circle at 75% 60%, rgba(255,255,255,0.5) 1px, transparent 1.5px), radial-gradient(circle at 50% 85%, rgba(255,255,255,0.4) 1px, transparent 1.5px)',
          backgroundSize: '180px 180px, 240px 240px, 200px 200px' }} />

      {/* Mobile header row: level + streak */}
      <div className="sm:hidden flex items-center justify-between mb-3 relative z-10">
        <div className="px-2.5 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
          <span className="text-[11px] font-bold text-foreground">Lv. {level}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-white shadow-md"
          style={{ background: 'linear-gradient(160deg, hsl(var(--familiar-500)), hsl(var(--familiar-700)))' }}>
          <Flame size={14} className="text-orange-300" />
          <span className="text-sm font-extrabold tabular-nums">{streak}</span>
          <span className="text-[10px] opacity-90 font-medium">day</span>
        </div>
      </div>

      {/* Level chip — desktop only */}
      <div className="hidden sm:block absolute top-5 left-5 z-10 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
        <div className="text-[11px] font-bold text-foreground leading-none">Lv. {level}</div>
      </div>

      {/* Streak badge — desktop only, compact */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="hidden sm:flex absolute top-5 right-5 z-10 items-center gap-1.5 rounded-2xl px-4 py-2.5 text-white shadow-xl shadow-familiar-700/30"
        style={{ background: 'linear-gradient(160deg, hsl(var(--familiar-500)), hsl(var(--familiar-700)))' }}
      >
        <Flame size={16} className="text-orange-300 animate-bounce-soft" />
        <span className="text-xl font-extrabold tabular-nums leading-none">{streak}</span>
        <span className="text-[10px] font-medium opacity-90">day streak</span>
      </motion.div>

      {/* Main content row */}
      <div className="relative z-[1] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-2 sm:pt-6">
        {/* XP column (left) — desktop only */}
        <div className="hidden sm:flex flex-col items-start pt-2 w-20 shrink-0">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase mt-12">
            {xpInLevel} / {xpToNext} XP
          </div>
          <div className="mt-2 h-1.5 w-24 rounded-full bg-white/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-familiar-500 to-familiar-700"
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="relative mx-auto sm:mx-0 w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 shrink-0">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full overflow-hidden shadow-2xl shadow-familiar-700/20 ring-[4px] sm:ring-[6px] ring-white/70"
            style={{
              background: `radial-gradient(circle at 30% 30%, hsl(var(--familiar-200)), hsl(var(--familiar-300) / 0.6))`,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Fallback size={64} className="text-familiar-700/40 sm:w-[88px] sm:h-[88px]" strokeWidth={1.5} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column: name + mood */}
        <div className="flex-1 text-center sm:text-left">
          <button
            onClick={onEditName}
            className="inline-flex items-center gap-2 group"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{name}</h2>
            <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </button>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Feeling <span className="font-semibold text-foreground">{meta.label.toLowerCase()}</span> today
          </p>
          <button
            onClick={onChangeMood}
            className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-white/70 shadow-sm hover:bg-white transition"
          >
            <span className="text-lg leading-none">{meta.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{meta.label}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {/* Mobile-only best streak */}
          <div className="sm:hidden mt-3 text-[11px] text-muted-foreground font-medium">
            Best streak: {bestStreak} days
          </div>
        </div>
      </div>

      {/* XP bar mobile */}
      <div className="sm:hidden mt-4">
        <div className="flex justify-between text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
          <span>Lv. {level}</span><span>{xpInLevel} / {xpToNext} XP</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-white/60 overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-familiar-500 to-familiar-700"
          />
        </div>
      </div>
    </motion.section>
  );
};

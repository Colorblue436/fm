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
  weekProgress?: boolean[]; // 7 days, M-S
  onEditName?: () => void;
  onChangeMood?: () => void;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HeroPetCard: React.FC<Props> = ({
  name, type, avatarUrl, mood, streak, bestStreak, level,
  xpInLevel, xpToNext, weekProgress, onEditName, onChangeMood,
}) => {
  const meta = MOOD_META[mood];
  const Fallback = type?.toLowerCase() === 'cat' ? Cat : Dog;
  const pct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
  const week = weekProgress ?? Array(7).fill(false).map((_, i) => i < (streak % 7));
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-[28px] overflow-hidden p-5 sm:p-7 min-h-[280px] shadow-lg shadow-familiar-500/5 border border-white/40"
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

      {/* Level chip */}
      <div className="absolute top-5 left-5 z-10 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
        <div className="text-[11px] font-bold text-foreground leading-none">Lv. {level}</div>
      </div>

      {/* Streak card (top-right) */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-5 right-5 z-10 rounded-2xl px-4 py-3 text-white shadow-xl shadow-familiar-700/30"
        style={{ background: 'linear-gradient(160deg, hsl(var(--familiar-500)), hsl(var(--familiar-700)))' }}
      >
        <div className="flex items-center gap-1.5">
          <Flame size={16} className="text-orange-300 animate-bounce-soft" />
          <span className="text-2xl font-extrabold tabular-nums leading-none">{streak}</span>
        </div>
        <div className="text-[10px] font-medium opacity-90 mt-0.5">day streak</div>
        <div className="flex gap-[3px] mt-2">
          {DAYS.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[9px] opacity-70 font-semibold">{d}</span>
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold transition
                ${week[i] ? 'bg-white text-familiar-700' : i === todayIdx ? 'bg-white/30 ring-1 ring-white/60' : 'bg-white/20'}`}>
                {week[i] ? '✓' : i === todayIdx ? '•' : ''}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] opacity-80 mt-2 font-medium">Best streak: {bestStreak}</div>
      </motion.div>

      {/* Main content row */}
      <div className="relative z-[1] flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pt-12 sm:pt-6">
        {/* XP column (left) */}
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
        <div className="relative mx-auto sm:mx-0 w-44 h-44 sm:w-52 sm:h-52 shrink-0">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full overflow-hidden shadow-2xl shadow-familiar-700/20 ring-[6px] ring-white/70"
            style={{
              background: `radial-gradient(circle at 30% 30%, hsl(var(--familiar-200)), hsl(var(--familiar-300) / 0.6))`,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Fallback size={88} className="text-familiar-700/40" strokeWidth={1.5} />
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{name}</h2>
            <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </button>
          <p className="text-base text-muted-foreground mt-1.5">
            Feeling <span className="font-semibold text-foreground">{meta.label.toLowerCase()}</span> today
          </p>
          <button
            onClick={onChangeMood}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-white/70 shadow-sm hover:bg-white transition"
          >
            <span className="text-lg leading-none">{meta.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{meta.label}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* XP bar mobile */}
      <div className="sm:hidden mt-5">
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

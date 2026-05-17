import React from 'react';
import { motion } from 'framer-motion';
import { Dog, Cat, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOOD_META, type Mood } from '@/lib/gamification';

interface Props {
  name: string;
  type?: string;
  avatarUrl?: string;
  mood: Mood;
  streak: number;
  level: number;
  totalPets: number;
  onPrevPet?: () => void;
  onNextPet?: () => void;
}

const moodPhrase = (name: string, mood: Mood) => {
  const map: Record<Mood, string> = {
    happy: `${name} is feeling happy today`,
    playful: `${name} is feeling playful today`,
    sleepy: `${name} is a little sleepy`,
    hungry: `${name} could use a meal`,
    lonely: `${name} misses you a little`,
    sick: `${name} isn't feeling their best`,
  };
  return map[mood];
};

export const HeroPet: React.FC<Props> = ({
  name, type, avatarUrl, mood, streak, level, totalPets, onPrevPet, onNextPet,
}) => {
  const meta = MOOD_META[mood];
  const Fallback = type?.toLowerCase() === 'cat' ? Cat : Dog;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-[2rem] overflow-hidden px-6 pt-10 pb-8 text-center"
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, hsl(var(--${meta.color}) / 0.35), transparent 60%), linear-gradient(180deg, hsl(var(--familiar-50)), hsl(var(--background)))`,
      }}
    >
      {/* Streak chip */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border/60 shadow-sm">
        <Flame size={14} className={`text-orange-500 ${streak > 0 ? 'animate-bounce-soft' : 'opacity-50'}`} />
        <span className="text-xs font-bold text-foreground tabular-nums">{streak}</span>
      </div>

      {/* Level chip */}
      <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border/60 shadow-sm text-xs font-semibold text-foreground">
        Lv. {level}
      </div>

      {/* Avatar with floating animation + mood halo */}
      <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full shadow-xl overflow-hidden ring-4 ring-card"
          style={{
            background: `radial-gradient(circle at 30% 30%, hsl(var(--${meta.color}) / 0.4), hsl(var(--${meta.color}) / 0.15))`,
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Fallback size={72} className="text-foreground/40" strokeWidth={1.5} />
            </div>
          )}
        </motion.div>
        {/* Mood emoji bubble */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="absolute -bottom-1 -right-1 w-14 h-14 rounded-full bg-card shadow-lg flex items-center justify-center text-3xl ring-4 ring-card"
        >
          {meta.emoji}
        </motion.div>
      </div>

      {/* Pet name + mood phrase */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-1.5">
        {name}
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
        {moodPhrase(name, mood)}
      </p>

      {/* Pet switcher dots */}
      {totalPets > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={onPrevPet}
            className="p-1.5 rounded-full bg-card/80 border border-border/60 hover:bg-card transition"
            aria-label="Previous pet"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-muted-foreground font-medium">{totalPets} pets</span>
          <button
            onClick={onNextPet}
            className="p-1.5 rounded-full bg-card/80 border border-border/60 hover:bg-card transition"
            aria-label="Next pet"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.section>
  );
};

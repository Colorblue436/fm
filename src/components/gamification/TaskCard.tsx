import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, UtensilsCrossed, Footprints, Pill, Scissors, Droplet, Trash2, ToyBrick, GraduationCap, Sparkles } from 'lucide-react';
import type { TaskCategory } from '@/lib/taskEngine';
import type { DailyTask } from '@/hooks/useDailyTasks';
import { completeTask } from '@/lib/taskEngine';
import { useToast } from '@/hooks/use-toast';

const CAT_ICON: Record<TaskCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  feeding: UtensilsCrossed,
  walk: Footprints,
  medicine: Pill,
  grooming: Scissors,
  hydration: Droplet,
  litter: Trash2,
  play: ToyBrick,
  training: GraduationCap,
  other: Sparkles,
};

const CAT_TINT: Record<TaskCategory, string> = {
  feeding: 'bg-orange-500/10 text-orange-600',
  walk: 'bg-emerald-500/10 text-emerald-600',
  medicine: 'bg-rose-500/10 text-rose-600',
  grooming: 'bg-violet-500/10 text-violet-600',
  hydration: 'bg-sky-500/10 text-sky-600',
  litter: 'bg-amber-500/10 text-amber-700',
  play: 'bg-pink-500/10 text-pink-600',
  training: 'bg-indigo-500/10 text-indigo-600',
  other: 'bg-muted text-muted-foreground',
};

interface Props { task: DailyTask; onComplete?: () => void }

export const TaskCard: React.FC<Props> = ({ task, onComplete }) => {
  const Icon = CAT_ICON[task.category];
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(task.completed);
  const [popXp, setPopXp] = useState<number | null>(null);
  const { toast } = useToast();

  const handleComplete = async () => {
    if (done || busy) return;
    setBusy(true);
    try {
      const res = await completeTask(task);
      setDone(true);
      setPopXp(res.xpEarned);
      setTimeout(() => setPopXp(null), 1200);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, scalar: 0.8 });
      if (res.leveledUp) {
        toast({ title: '🎉 Level up!', description: `You reached level ${res.newLevel}` });
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      }
      onComplete?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`relative flex items-center gap-3 p-3 rounded-2xl border transition-all ${done ? 'bg-muted/40 border-border/50 opacity-70' : 'bg-card border-border hover:shadow-md'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CAT_TINT[task.category]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {task.category}{task.time_of_day ? ` · ${task.time_of_day}` : ''} · +{task.xp_reward} XP
        </p>
      </div>
      <button
        onClick={handleComplete}
        disabled={done || busy}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          done
            ? 'bg-emerald-500 text-white'
            : 'bg-familiar-500 text-white hover:scale-105 active:scale-95 shadow-md'
        } disabled:opacity-100`}
        aria-label={done ? 'Completed' : 'Mark complete'}
      >
        <Check size={18} strokeWidth={3} className={done ? 'animate-pop' : ''} />
      </button>
      {popXp !== null && (
        <span className="absolute -top-2 right-12 text-sm font-bold text-familiar-600 animate-float-up pointer-events-none">
          +{popXp} XP
        </span>
      )}
    </div>
  );
};

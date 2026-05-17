import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { TaskCard } from '@/components/gamification/TaskCard';
import type { DailyTask } from '@/hooks/useDailyTasks';

interface Props {
  tasks: DailyTask[];
  onComplete: () => void;
  onViewAll: () => void;
}

export const TodayTasksSection: React.FC<Props> = ({ tasks, onComplete, onViewAll }) => {
  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total ? done / total : 0;
  const remaining = tasks.filter(t => !t.completed);
  const visible = (remaining.length ? remaining : tasks).slice(0, 3);

  // Progress ring math
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="space-y-4"
    >
      {/* Section header with progress ring */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size/2} cy={size/2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
              <circle
                cx={size/2} cy={size/2} r={r}
                stroke="hsl(var(--familiar-500))" strokeWidth={stroke} fill="none"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - pct)}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground tabular-nums">
              {done}/{total || 0}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">Today's care</h2>
            <p className="text-xs text-muted-foreground">
              {total === 0 ? 'No tasks yet' : pct === 1 ? 'All done — great job!' : `${total - done} left`}
            </p>
          </div>
        </div>

        {total > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm text-familiar-600 hover:text-familiar-700 font-medium flex items-center gap-0.5"
          >
            All <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Tasks */}
      {total === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
          <Sparkles size={28} className="mx-auto text-familiar-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            Add a routine to start caring daily.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map(t => (
            <TaskCard key={t.id} task={t} onComplete={onComplete} />
          ))}
          {tasks.length > visible.length && (
            <button
              onClick={onViewAll}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition"
            >
              + {tasks.length - visible.length} more
            </button>
          )}
        </div>
      )}
    </motion.section>
  );
};

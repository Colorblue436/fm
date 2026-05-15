import React from 'react';
import { MOOD_META, type Mood } from '@/lib/gamification';

interface Props { mood: Mood; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }

export const MoodBubble: React.FC<Props> = ({ mood, size = 'md', showLabel = true }) => {
  const meta = MOOD_META[mood];
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-4xl' : size === 'sm' ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-2xl';
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center shadow-lg animate-bounce-soft`}
        style={{ background: `radial-gradient(circle at 30% 30%, hsl(var(--${meta.color}) / 0.9), hsl(var(--${meta.color}) / 0.5))` }}
        aria-label={`Mood: ${meta.label}`}
      >
        <span>{meta.emoji}</span>
      </div>
      {showLabel && (
        <div>
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="text-xs text-muted-foreground">{meta.tone}</p>
        </div>
      )}
    </div>
  );
};

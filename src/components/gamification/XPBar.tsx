import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props { level: number; xpInLevel: number; xpToNext: number; progress: number }

export const XPBar: React.FC<Props> = ({ level, xpInLevel, xpToNext, progress }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 font-semibold text-foreground">
        <Sparkles size={14} className="text-familiar-500" /> Level {level}
      </span>
      <span className="text-muted-foreground tabular-nums">{xpInLevel} / {xpToNext} XP</span>
    </div>
    <div className="h-3 rounded-full bg-muted overflow-hidden relative">
      <div
        className="h-full gradient-xp rounded-full transition-all duration-700 ease-out relative overflow-hidden"
        style={{ width: `${Math.max(2, progress * 100)}%` }}
      >
        <span className="absolute inset-0 shimmer" />
      </div>
    </div>
  </div>
);

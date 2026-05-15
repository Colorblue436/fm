import React from 'react';
import { Flame } from 'lucide-react';

export const StreakFlame: React.FC<{ days: number }> = ({ days }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
    <Flame size={16} className={`text-orange-500 ${days > 0 ? 'animate-bounce-soft' : 'opacity-50'}`} />
    <span className="text-sm font-bold text-orange-600 tabular-nums">{days}</span>
    <span className="text-xs text-orange-600/70">day streak</span>
  </div>
);

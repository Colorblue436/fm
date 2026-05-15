import React from 'react';
import { BADGES } from '@/lib/achievements';

export const BadgeGrid: React.FC<{ earned: Set<string> }> = ({ earned }) => (
  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
    {BADGES.map(b => {
      const has = earned.has(b.key);
      return (
        <div
          key={b.key}
          className={`relative p-3 rounded-2xl border text-center transition-all ${
            has ? 'bg-gradient-to-br from-familiar-100 to-familiar-50 border-familiar-200' : 'bg-muted/30 border-border opacity-60 grayscale'
          }`}
          title={b.description}
        >
          <div className="text-2xl mb-1">{b.icon}</div>
          <p className="text-[11px] font-semibold text-foreground leading-tight">{b.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{b.description}</p>
        </div>
      );
    })}
  </div>
);

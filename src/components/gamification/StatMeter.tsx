import React from 'react';

interface Props {
  value: number; // 0-100
  label: string;
  icon?: React.ReactNode;
  variant?: 'happiness' | 'health' | 'xp';
}

export const StatMeter: React.FC<Props> = ({ value, label, icon, variant = 'happiness' }) => {
  const v = Math.max(0, Math.min(100, value));
  const cls = variant === 'health' ? 'gradient-health' : variant === 'xp' ? 'gradient-xp' : 'gradient-happiness';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">{icon}{label}</span>
        <span className="text-muted-foreground tabular-nums">{Math.round(v)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
        <div
          className={`h-full ${cls} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
          style={{ width: `${v}%` }}
        >
          <span className="absolute inset-0 shimmer" />
        </div>
      </div>
    </div>
  );
};

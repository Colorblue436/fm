import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Gem, Coins } from 'lucide-react';

interface Props {
  name?: string;
  avatarUrl?: string;
  xp: number;
  coins: number;
  onProfile: () => void;
}

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const TopGreeting: React.FC<Props> = ({ name, avatarUrl, xp, coins, onProfile }) => {
  const first = (name ?? 'there').split(' ')[0];
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-foreground leading-tight">
          {greet()}, {first}! <span className="inline-block animate-bounce-soft">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Let's make today a great day for your pets.
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/70 shadow-sm">
          <Gem size={14} className="text-familiar-500" />
          <span className="text-xs font-bold text-foreground tabular-nums">{xp}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/70 shadow-sm">
          <Coins size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-foreground tabular-nums">{coins.toLocaleString()}</span>
        </div>
        <button
          className="w-9 h-9 rounded-full bg-card border border-border/70 flex items-center justify-center hover:bg-muted transition shadow-sm"
          aria-label="Notifications"
        >
          <Bell size={16} className="text-muted-foreground" />
        </button>
        <button
          onClick={onProfile}
          className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-card shadow-md hover:scale-105 transition"
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name ?? 'Profile'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-familiar-400 to-familiar-600 text-white font-bold flex items-center justify-center">
              {first.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>
    </motion.header>
  );
};

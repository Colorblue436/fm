import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface Props {
  message: string;
  onChat: () => void;
}

export const FamiliarSaysCard: React.FC<Props> = ({ message, onChat }) => (
  <motion.section
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.05 }}
    className="rounded-3xl bg-card border border-border/70 p-5 shadow-sm"
  >
    <h3 className="text-base font-bold text-foreground mb-3">Familiar says</h3>

    <div className="flex items-start gap-3">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
        style={{ background: 'linear-gradient(160deg, hsl(var(--familiar-200)), hsl(var(--familiar-400)))' }}
      >
        <Bot size={26} className="text-white" />
      </motion.div>
      <div className="relative flex-1 rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5 text-sm text-foreground leading-snug">
        {message}
      </div>
    </div>

    <button
      onClick={onChat}
      className="mt-4 w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-familiar-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
      style={{ background: 'linear-gradient(120deg, hsl(var(--familiar-500)), hsl(var(--familiar-700)))' }}
    >
      Chat with Familiar
    </button>
  </motion.section>
);

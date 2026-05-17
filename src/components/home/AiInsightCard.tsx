import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  message: string;
  onOpen: () => void;
}

export const AiInsightCard: React.FC<Props> = ({ message, onOpen }) => (
  <motion.button
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.4 }}
    onClick={onOpen}
    className="w-full text-left rounded-2xl p-4 flex items-center gap-3 border border-familiar-200/60 bg-gradient-to-br from-familiar-50 to-card hover:shadow-md transition-all group"
  >
    <div className="w-10 h-10 rounded-xl bg-familiar-500/15 flex items-center justify-center flex-shrink-0">
      <Sparkles size={18} className="text-familiar-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-familiar-600 mb-0.5">
        Familiar says
      </p>
      <p className="text-sm text-foreground leading-snug">{message}</p>
    </div>
    <ChevronRight size={18} className="text-muted-foreground group-hover:text-familiar-600 transition-colors flex-shrink-0" />
  </motion.button>
);

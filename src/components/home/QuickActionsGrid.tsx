import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Bell, MapPin, Stethoscope } from 'lucide-react';

interface Props {
  onAddRecord: () => void;
  onAddReminder: () => void;
  onFindNearby: () => void;
  onCheckSymptoms: () => void;
}

export const QuickActionsGrid: React.FC<Props> = ({ onAddRecord, onAddReminder, onFindNearby, onCheckSymptoms }) => {
  const actions = [
    { icon: FileText, label: 'Add Record', onClick: onAddRecord, tint: 'bg-sky-100', icon_color: 'text-sky-600' },
    { icon: Bell, label: 'Add Reminder', onClick: onAddReminder, tint: 'bg-rose-100', icon_color: 'text-rose-500' },
    { icon: MapPin, label: 'Find Nearby', onClick: onFindNearby, tint: 'bg-emerald-100', icon_color: 'text-emerald-600' },
    { icon: Stethoscope, label: 'Check Symptoms', onClick: onCheckSymptoms, tint: 'bg-cyan-100', icon_color: 'text-cyan-600' },
  ];
  return (
    <motion.section
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-3xl bg-card border border-border/70 p-5 shadow-sm"
    >
      <h3 className="text-base font-bold text-foreground mb-4">Quick actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="group flex flex-col items-center gap-2 p-3 sm:p-2 rounded-2xl hover:bg-muted/60 transition"
          >
            <div className={`w-14 h-14 sm:w-12 sm:h-12 rounded-2xl ${a.tint} flex items-center justify-center shadow-sm group-hover:-translate-y-0.5 group-hover:shadow-md transition-all`}>
              <a.icon size={22} className={a.icon_color} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] sm:text-[10.5px] font-semibold text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
};

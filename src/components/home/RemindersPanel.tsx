import React from 'react';
import { Bell, Plus, Syringe, Pill, Stethoscope, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface Reminder {
  id: string;
  title: string;
  date: string;
  is_completed: boolean;
  pet_id: string | null;
}

interface RemindersPanelProps {
  reminders: Reminder[];
  onAdd: () => void;
  onViewAll: () => void;
}

const getReminderIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('vaccin') || t.includes('shot')) return Syringe;
  if (t.includes('med') || t.includes('pill') || t.includes('drug')) return Pill;
  if (t.includes('vet') || t.includes('checkup') || t.includes('appointment')) return Stethoscope;
  return Clock;
};

const getStatus = (date: string) => {
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: 'bg-destructive/10 text-destructive' };
  if (isToday(d)) return { label: 'Today', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' };
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' };
  return { label: 'Upcoming', color: 'bg-muted text-muted-foreground' };
};

export const RemindersPanel: React.FC<RemindersPanelProps> = ({ reminders, onAdd, onViewAll }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-familiar-500" />
          Reminders
        </h2>
        <Button size="sm" variant="ghost" onClick={onAdd} className="h-7 text-xs">
          <Plus size={13} className="mr-1" /> Add
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div className="py-6 text-center">
          <Bell size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground mb-3">No upcoming reminders</p>
          <Button size="sm" variant="outline" onClick={onAdd} className="h-8 text-xs">
            Create your first reminder
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {reminders.slice(0, 4).map((r) => {
              const Icon = getReminderIcon(r.title);
              const status = getStatus(r.date);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-familiar-100 dark:bg-familiar-900/40 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-familiar-600 dark:text-familiar-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(r.date), 'MMM d · h:mm a')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
          {reminders.length > 4 && (
            <button onClick={onViewAll} className="w-full text-xs text-familiar-500 hover:text-familiar-600 font-medium mt-3 pt-3 border-t border-border">
              View all {reminders.length} reminders
            </button>
          )}
        </>
      )}
    </div>
  );
};

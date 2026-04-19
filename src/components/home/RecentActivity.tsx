import React from 'react';
import { Activity, FileText, MessageSquare, Bell, Syringe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'record' | 'chat' | 'reminder' | 'vaccine';
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

const ICON_MAP = {
  record: { Icon: FileText, color: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40' },
  chat: { Icon: MessageSquare, color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40' },
  reminder: { Icon: Bell, color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40' },
  vaccine: { Icon: Syringe, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40' },
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ items }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
        <Activity size={16} className="text-familiar-500" />
        Recent Activity
      </h2>

      {items.length === 0 ? (
        <div className="py-6 text-center">
          <Activity size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No recent activity yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => {
              const { Icon, color } = ICON_MAP[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3 relative">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 ring-4 ring-card relative z-10`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

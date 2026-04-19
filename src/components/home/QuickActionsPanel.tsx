import React from 'react';
import { Upload, Stethoscope, Lightbulb, Sparkles, Zap } from 'lucide-react';

interface QuickActionsPanelProps {
  onUploadRecord: () => void;
  onCheckSymptoms: () => void;
  onViewInsights: () => void;
  onOpenAssistant: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onUploadRecord, onCheckSymptoms, onViewInsights, onOpenAssistant,
}) => {
  const actions = [
    { icon: Upload, label: 'Upload Record', onClick: onUploadRecord, tone: 'from-sky-500 to-sky-600' },
    { icon: Stethoscope, label: 'Check Symptoms', onClick: onCheckSymptoms, tone: 'from-rose-500 to-rose-600' },
    { icon: Lightbulb, label: 'View Insights', onClick: onViewInsights, tone: 'from-amber-500 to-amber-600' },
    { icon: Sparkles, label: 'AI Assistant', onClick: onOpenAssistant, tone: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
        <Zap size={16} className="text-familiar-500" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="group relative overflow-hidden flex flex-col items-start gap-2 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md text-left"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.tone} flex items-center justify-center shadow-sm`}>
              <a.icon size={16} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

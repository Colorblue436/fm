import React from 'react';
import { Lightbulb, Activity, Brain } from 'lucide-react';

interface Pet {
  name: string;
  type: string;
  breed?: string;
  age: number;
}

interface PetInsightsProps {
  pet: Pet;
}

const ICONS = [Activity, Brain, Lightbulb];
const TONES = [
  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40',
  'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40',
  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
];

const generateInsights = (pet: Pet): string[] => {
  const t = pet.type.toLowerCase();
  const breed = (pet.breed || '').toLowerCase();
  const insights: string[] = [];

  if (t === 'dog') {
    insights.push(`${pet.name} may benefit from 30–60 minutes of daily activity.`);
    if (breed.includes('lab') || breed.includes('retriever') || breed.includes('shepherd')) {
      insights.push(`${pet.breed}s thrive on mental stimulation — try puzzle feeders.`);
    } else {
      insights.push(`Regular play sessions strengthen your bond with ${pet.name}.`);
    }
    insights.push(pet.age >= 7 ? `As a senior, watch ${pet.name}'s joint health closely.` : `Early socialization shapes lifelong behavior.`);
  } else if (t === 'cat') {
    insights.push(`Cats like ${pet.name} sleep 12–16 hrs/day — provide a quiet retreat.`);
    insights.push(`Vertical space (cat trees) reduces stress and boredom.`);
    insights.push(pet.age >= 10 ? `Schedule biannual senior wellness checks for ${pet.name}.` : `Interactive toys keep hunting instincts sharp.`);
  } else {
    insights.push(`Track ${pet.name}'s diet and weight monthly for optimal health.`);
    insights.push(`Consistent routines reduce stress in ${t}s.`);
    insights.push(`Annual vet checkups catch issues early.`);
  }

  return insights.slice(0, 3);
};

export const PetInsights: React.FC<PetInsightsProps> = ({ pet }) => {
  const insights = generateInsights(pet);
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-familiar-400 to-familiar-600 flex items-center justify-center">
          <Lightbulb size={14} className="text-white" />
        </div>
        <h2 className="text-base font-bold text-foreground">Insights for {pet.name}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((text, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${TONES[i % TONES.length]}`}
            >
              <Icon size={18} className="mb-2 opacity-80" />
              <p className="text-xs leading-relaxed font-medium">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

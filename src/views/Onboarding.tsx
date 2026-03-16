import React, { useState } from 'react';
import { Dog, Users, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { motion } from 'framer-motion';

interface OnboardingProps {
  onComplete: (role: 'visitor' | 'pet_parent' | 'both') => void;
}

const roles = [
  {
    value: 'pet_parent' as const,
    label: 'Pet Parent',
    description: 'Manage your pets, set reminders, find vets, and chat with AI.',
    icon: Dog,
    color: 'from-amber-400 to-orange-500',
  },
  {
    value: 'visitor' as const,
    label: 'Visitor',
    description: 'Explore the community, groups, drops, and bulletin board.',
    icon: Users,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    value: 'both' as const,
    label: 'Both',
    description: 'Access everything — pet care tools and community features.',
    icon: Layers,
    color: 'from-purple-400 to-pink-500',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<'visitor' | 'pet_parent' | 'both' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onComplete(selected);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FamiliarLogo className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">How will you use Familiar?</h1>
          <p className="text-sm text-muted-foreground">Choose your experience. You can change this anytime in Settings.</p>
        </div>

        <div className="space-y-3">
          {roles.map((role, i) => (
            <motion.button
              key={role.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}
              onClick={() => setSelected(role.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                selected === role.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                <role.icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{role.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected === role.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              }`}>
                {selected === role.value && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </motion.button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || submitting}
          className="w-full h-12 text-base font-semibold rounded-2xl"
        >
          {submitting ? 'Setting up...' : 'Continue'}
        </Button>
      </motion.div>
    </div>
  );
};

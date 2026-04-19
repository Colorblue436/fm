import React from 'react';
import { motion } from 'framer-motion';
import { Dog, Syringe, Stethoscope, Plus, Sparkles, Bell, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  avatar_url?: string;
}

interface PetHeaderCardProps {
  pet: Pet;
  nextVaccineDate?: string | null;
  lastCheckup?: string | null;
  onAddRecord: () => void;
  onAskAI: () => void;
  onAddReminder: () => void;
  onSwitchPet?: () => void;
  totalPets?: number;
}

export const PetHeaderCard: React.FC<PetHeaderCardProps> = ({
  pet, nextVaccineDate, lastCheckup, onAddRecord, onAskAI, onAddReminder, onSwitchPet, totalPets = 1,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
        {/* Avatar block */}
        <div className="relative bg-gradient-to-br from-familiar-100 to-familiar-200/40 dark:from-familiar-900/30 dark:to-familiar-800/10 p-5 flex items-center justify-center">
          {pet.avatar_url ? (
            <motion.img
              src={pet.avatar_url}
              alt={pet.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover ring-4 ring-card shadow-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-familiar-200 dark:bg-familiar-800/40 flex items-center justify-center ring-4 ring-card shadow-md">
              <Dog size={56} className="text-familiar-600" />
            </div>
          )}
          {totalPets > 1 && onSwitchPet && (
            <button
              onClick={onSwitchPet}
              className="absolute bottom-2 right-2 text-[10px] font-semibold bg-card/90 backdrop-blur-sm border border-border rounded-full px-2 py-1 text-foreground hover:bg-card transition-colors"
            >
              Switch ({totalPets})
            </button>
          )}
        </div>

        {/* Info block */}
        <div className="p-5 md:p-6 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{pet.name}</h1>
              <span className="text-xs font-medium bg-familiar-100 text-familiar-700 dark:bg-familiar-900/50 dark:text-familiar-300 px-2 py-0.5 rounded-full">
                {pet.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
              {pet.breed && <span>{pet.breed}</span>}
              {pet.breed && <span className="text-muted-foreground/50">·</span>}
              <Cake size={13} className="text-muted-foreground/70" />
              <span>{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Syringe size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Next vaccine</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {nextVaccineDate ? format(new Date(nextVaccineDate), 'MMM d, yyyy') : 'Not scheduled'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0">
                <Stethoscope size={14} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Last checkup</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {lastCheckup ? format(new Date(lastCheckup), 'MMM d, yyyy') : 'No record yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={onAddRecord} className="bg-familiar-500 hover:bg-familiar-600 text-white">
              <Plus size={14} className="mr-1" /> Add Record
            </Button>
            <Button size="sm" variant="outline" onClick={onAskAI}>
              <Sparkles size={14} className="mr-1" /> Ask AI
            </Button>
            <Button size="sm" variant="outline" onClick={onAddReminder}>
              <Bell size={14} className="mr-1" /> Add Reminder
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

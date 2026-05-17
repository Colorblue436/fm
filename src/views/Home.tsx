import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dog, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppView } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { HeroPet } from '@/components/home/HeroPet';
import { TodayTasksSection } from '@/components/home/TodayTasksSection';
import { AiInsightCard } from '@/components/home/AiInsightCard';
import { usePetStats } from '@/hooks/usePetStats';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useGamification } from '@/hooks/useGamification';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  avatar_url?: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePetIdx, setActivePetIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const { data } = await supabase.from('pets').select('*').order('created_at', { ascending: false });
      if (data) setPets(data);
      setLoading(false);
    })();
  }, []);

  const activePet = pets[activePetIdx];
  const { stats } = usePetStats(activePet?.id);
  const { tasks, reload } = useDailyTasks(userId, activePet?.id, activePet?.type);
  const { data: gam, reload: reloadGam } = useGamification(userId);

  const insight = useMemo(() => {
    if (!activePet) return '';
    const remaining = tasks.filter(t => !t.completed);
    if (!tasks.length) return `Set up a daily routine for ${activePet.name} to get started.`;
    if (!remaining.length) return `${activePet.name} has finished every task today — well done!`;
    const next = remaining[0];
    const verb: Record<string, string> = {
      walk: 'still needs a walk', feeding: 'is waiting for a meal',
      medicine: 'has medicine to take', grooming: 'is due for grooming',
      hydration: 'needs fresh water', litter: 'needs a clean litter box',
      play: 'wants to play', training: 'is ready for training', other: 'has something pending',
    };
    return `${activePet.name} ${verb[next.category] ?? 'has tasks pending'} today.`;
  }, [activePet, tasks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-familiar-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-familiar-500 to-familiar-600 p-10 md:p-14 text-center shadow-md"
      >
        <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-4">
          <Dog size={32} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Familiar</h1>
        <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
          Add your first pet to begin your daily care journey.
        </p>
        <Button
          onClick={() => onNavigate(AppView.PETS)}
          size="lg"
          className="bg-white text-familiar-700 hover:bg-white/90 font-semibold"
        >
          <Plus size={18} className="mr-1.5" /> Add Your First Pet
        </Button>
      </motion.div>
    );
  }

  const switchPet = (dir: 1 | -1) =>
    setActivePetIdx(p => (p + dir + pets.length) % pets.length);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-28 md:pb-8">
      <HeroPet
        name={activePet.name}
        type={activePet.type}
        avatarUrl={activePet.avatar_url}
        mood={stats?.mood ?? 'happy'}
        streak={gam?.currentStreak ?? stats?.current_streak ?? 0}
        level={gam?.level ?? stats?.level ?? 1}
        totalPets={pets.length}
        onPrevPet={() => switchPet(-1)}
        onNextPet={() => switchPet(1)}
      />

      <TodayTasksSection
        tasks={tasks}
        onComplete={() => { reload(); reloadGam(); }}
        onViewAll={() => onNavigate(AppView.TASKS)}
      />

      <AiInsightCard
        message={insight}
        onOpen={() => onNavigate(AppView.ASSISTANT)}
      />
    </div>
  );
};

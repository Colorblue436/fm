import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dog, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppView } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { TopGreeting } from '@/components/home/TopGreeting';
import { HeroPetCard } from '@/components/home/HeroPetCard';
import { TodayTasksSection } from '@/components/home/TodayTasksSection';
import { ProgressPanel } from '@/components/home/ProgressPanel';
import { FamiliarSaysCard } from '@/components/home/FamiliarSaysCard';
import { QuickActionsGrid } from '@/components/home/QuickActionsGrid';
import { MemoriesStrip } from '@/components/home/MemoriesStrip';
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
  avatar_url?: string;
}

interface Profile {
  display_name?: string;
  avatar_url?: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePetIdx, setActivePetIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const [{ data: petsData }, { data: profileData }] = await Promise.all([
        supabase.from('pets').select('id, name, type, avatar_url').order('created_at', { ascending: false }),
        supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).maybeSingle(),
      ]);
      if (petsData) setPets(petsData);
      if (profileData) setProfile(profileData);
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
      walk: `hasn't had a walk yet today. A 20-min walk will boost their mood!`,
      feeding: `is waiting for a meal — time to feed!`,
      medicine: `has medicine due. Don't forget the dose.`,
      grooming: `is due for grooming — a quick brush will do wonders.`,
      hydration: `needs fresh water — a small refill keeps them happy.`,
      litter: `needs a clean litter box.`,
      play: `wants to play! 10 min of play will lift their mood.`,
      training: `is ready for a quick training session.`,
      other: `has something pending today.`,
    };
    return `${activePet.name} ${verb[next.category] ?? 'has tasks pending today.'}`;
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
      <>
        <TopGreeting
          name={profile?.display_name}
          avatarUrl={profile?.avatar_url}
          xp={0} coins={0}
          onProfile={() => onNavigate(AppView.PROFILE)}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-familiar-500 to-familiar-700 p-10 md:p-14 text-center shadow-xl shadow-familiar-500/20"
        >
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-4">
            <Dog size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Familiar</h1>
          <p className="text-white/85 text-sm mb-6 max-w-md mx-auto">
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
      </>
    );
  }

  const level = gam?.level ?? stats?.level ?? 1;
  const xpInLevel = gam?.xpInLevel ?? 0;
  const xpToNext = gam?.xpToNext ?? 200;
  const totalXp = gam?.totalXp ?? 0;
  const streak = gam?.currentStreak ?? stats?.current_streak ?? 0;
  const bestStreak = gam?.longestStreak ?? stats?.longest_streak ?? 0;
  const tasksDone = gam?.totalCompletions ?? 0;
  const healthScore = stats?.health_score ?? 80;

  return (
    <div className="pb-28 md:pb-6">
      <TopGreeting
        name={profile?.display_name}
        avatarUrl={profile?.avatar_url}
        xp={xpInLevel}
        coins={totalXp}
        onProfile={() => onNavigate(AppView.PROFILE)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-5">
          <HeroPetCard
            name={activePet.name}
            type={activePet.type}
            avatarUrl={activePet.avatar_url}
            mood={stats?.mood ?? 'happy'}
            streak={streak}
            bestStreak={bestStreak}
            level={level}
            xpInLevel={xpInLevel}
            xpToNext={xpToNext}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-card border border-border/70 p-5 shadow-sm"
          >
            <TodayTasksSection
              tasks={tasks}
              onComplete={() => { reload(); reloadGam(); }}
              onViewAll={() => onNavigate(AppView.TASKS)}
            />
            <button
              onClick={() => onNavigate(AppView.TASKS)}
              className="mt-4 w-full py-3 rounded-2xl border border-dashed border-familiar-300 text-familiar-600 hover:bg-familiar-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={16} /> Add New Task
            </button>
          </motion.div>

          <MemoriesStrip petId={activePet.id} onSeeAll={() => onNavigate(AppView.STORAGE)} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-5">
          <ProgressPanel
            level={level}
            xpInLevel={xpInLevel}
            xpToNext={xpToNext}
            tasksDone={tasksDone}
            streak={streak}
            healthScore={healthScore}
            badgesEarned={gam?.earnedBadges.size ?? 0}
            onViewProfile={() => onNavigate(AppView.PROFILE)}
          />
          <FamiliarSaysCard
            message={insight}
            onChat={() => onNavigate(AppView.ASSISTANT)}
          />
          <QuickActionsGrid
            onAddRecord={() => onNavigate(AppView.HEALTH_RECORDS)}
            onAddReminder={() => onNavigate(AppView.REMINDERS)}
            onFindNearby={() => onNavigate(AppView.NEARBY)}
            onCheckSymptoms={() => onNavigate(AppView.ASSISTANT)}
          />
        </div>
      </div>
    </div>
  );
};

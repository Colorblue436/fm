import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dog, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppView } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { PetHeaderCard } from '@/components/home/PetHeaderCard';
import { PetInsights } from '@/components/home/PetInsights';
import { RemindersPanel } from '@/components/home/RemindersPanel';
import { RecentActivity, ActivityItem } from '@/components/home/RecentActivity';
import { QuickActionsPanel } from '@/components/home/QuickActionsPanel';
import { PetGameCard } from '@/components/home/PetGameCard';

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
  updated_at?: string;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  is_completed: boolean;
  pet_id: string | null;
}

interface Vaccination {
  id: string;
  pet_id: string;
  name: string;
  date: string | null;
  next_due: string | null;
}

interface HealthRecord {
  id: string;
  title: string;
  pet_id: string | null;
  created_at: string;
}

interface ChatMsg {
  id: string;
  content: string;
  role: string;
  created_at: string | null;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [activePetIdx, setActivePetIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [petsRes, remindersRes, recordsRes, chatRes] = await Promise.all([
        supabase.from('pets').select('*').order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('is_completed', false).order('date', { ascending: true }).limit(10),
        supabase.from('health_records').select('id, title, pet_id, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('chat_messages').select('*').eq('role', 'user').order('created_at', { ascending: false }).limit(3),
      ]);

      if (petsRes.data) {
        setPets(petsRes.data);
        // Fetch vaccinations for all pets
        if (petsRes.data.length > 0) {
          const petIds = petsRes.data.map(p => p.id);
          const vaccRes = await supabase.from('vaccinations').select('*').in('pet_id', petIds);
          if (vaccRes.data) setVaccinations(vaccRes.data);
        }
      }
      if (remindersRes.data) setReminders(remindersRes.data);
      if (recordsRes.data) setHealthRecords(recordsRes.data);
      if (chatRes.data) setChatMessages(chatRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activePet = pets[activePetIdx];

  const { nextVaccine, lastCheckup, petReminders } = useMemo(() => {
    if (!activePet) return { nextVaccine: null, lastCheckup: null, petReminders: [] as Reminder[] };
    const now = new Date();
    const upcoming = vaccinations
      .filter(v => v.pet_id === activePet.id && v.next_due && new Date(v.next_due) >= now)
      .sort((a, b) => new Date(a.next_due!).getTime() - new Date(b.next_due!).getTime());
    const past = vaccinations
      .filter(v => v.pet_id === activePet.id && v.date)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
    return {
      nextVaccine: upcoming[0]?.next_due ?? null,
      lastCheckup: past[0]?.date ?? null,
      petReminders: reminders.filter(r => !r.pet_id || r.pet_id === activePet.id),
    };
  }, [activePet, vaccinations, reminders]);

  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    healthRecords.forEach(r => items.push({
      id: `r-${r.id}`, type: 'record', title: `Uploaded "${r.title}"`, timestamp: r.created_at,
    }));
    chatMessages.forEach(c => c.created_at && items.push({
      id: `c-${c.id}`, type: 'chat', title: `Asked: "${c.content.slice(0, 50)}${c.content.length > 50 ? '…' : ''}"`, timestamp: c.created_at,
    }));
    reminders.slice(0, 3).forEach(r => items.push({
      id: `rm-${r.id}`, type: 'reminder', title: `Reminder set: ${r.title}`, timestamp: r.date,
    }));
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [healthRecords, chatMessages, reminders]);

  const switchPet = () => setActivePetIdx((prev) => (prev + 1) % pets.length);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-familiar-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Empty state — no pets yet
  if (pets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-familiar-500 to-familiar-600 p-8 md:p-12 text-center shadow-md"
      >
        <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-4">
          <Dog size={32} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Familiar</h1>
        <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
          Add your first pet to unlock personalized insights, health tracking, and AI-powered care.
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

  return (
    <div className="space-y-5 pb-24 md:pb-4">
      {/* PET HEADER CARD — top priority */}
      <PetHeaderCard
        pet={activePet}
        nextVaccineDate={nextVaccine}
        lastCheckup={lastCheckup}
        onAddRecord={() => onNavigate(AppView.HEALTH_RECORDS)}
        onAskAI={() => onNavigate(AppView.ASSISTANT)}
        onAddReminder={() => onNavigate(AppView.REMINDERS)}
        onSwitchPet={switchPet}
        totalPets={pets.length}
      />

      {/* INSIGHTS */}
      <PetInsights pet={activePet} />

      {/* MAIN GRID: Reminders + Quick Actions + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RemindersPanel
            reminders={petReminders}
            onAdd={() => onNavigate(AppView.REMINDERS)}
            onViewAll={() => onNavigate(AppView.REMINDERS)}
          />
        </div>
        <div>
          <QuickActionsPanel
            onUploadRecord={() => onNavigate(AppView.HEALTH_RECORDS)}
            onCheckSymptoms={() => onNavigate(AppView.ASSISTANT)}
            onViewInsights={() => onNavigate(AppView.ASSISTANT)}
            onOpenAssistant={() => onNavigate(AppView.ASSISTANT)}
          />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <RecentActivity items={activityItems} />

      {/* OTHER PETS — quick access */}
      {pets.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Dog size={16} className="text-familiar-500" />
              Your Other Pets
            </h2>
            <button onClick={() => onNavigate(AppView.PETS)} className="text-xs text-familiar-500 hover:text-familiar-600 flex items-center gap-0.5 font-medium">
              Manage all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pets.filter((_, i) => i !== activePetIdx).slice(0, 4).map((pet, i) => {
              const realIdx = pets.findIndex(p => p.id === pet.id);
              return (
                <button
                  key={pet.id}
                  onClick={() => setActivePetIdx(realIdx)}
                  className="bg-card rounded-xl border border-border hover:border-familiar-300 hover:shadow-md transition-all overflow-hidden text-left group"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {pet.avatar_url ? (
                      <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dog size={28} className="text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{pet.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{pet.type} · {pet.age}y</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

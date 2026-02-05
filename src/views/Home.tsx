import React, { useState, useEffect } from 'react';
import { Dog, Calendar, Plus, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { AppView } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

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

interface Reminder {
  id: string;
  title: string;
  date: string;
  is_completed: boolean;
  pet_id: string | null;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [petsRes, remindersRes] = await Promise.all([
        supabase.from('pets').select('*').order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('is_completed', false).order('date', { ascending: true }).limit(5),
      ]);

      if (petsRes.data) setPets(petsRes.data);
      if (remindersRes.data) setReminders(remindersRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-red-500 bg-red-50';
    if (isToday(date)) return 'text-amber-600 bg-amber-50';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-familiar-500 to-familiar-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-background/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FamiliarLogo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome to Familiar</h1>
              <p className="text-familiar-100 text-sm">Your pet's best companion</p>
            </div>
          </div>
          
          <p className="text-white/80 mb-6 max-w-lg">
            {pets.length > 0 
              ? `You have ${pets.length} pet${pets.length > 1 ? 's' : ''} and ${reminders.length} upcoming task${reminders.length !== 1 ? 's' : ''}.`
              : 'Get started by adding your first pet!'}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => onNavigate(AppView.PETS)}
              className="bg-background text-familiar-600 hover:bg-background/90"
            >
              <Plus size={18} className="mr-2" />
              {pets.length > 0 ? 'Manage Pets' : 'Add Your Pet'}
            </Button>
          </div>
        </div>
      </div>

      {/* My Pets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Dog size={22} className="text-familiar-500" />
            My Pets
          </h2>
          {pets.length > 0 && (
            <button
              onClick={() => onNavigate(AppView.PETS)}
              className="text-sm text-familiar-500 hover:text-familiar-600 flex items-center gap-1"
            >
              View all <ChevronRight size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-familiar-500 border-t-transparent rounded-full" />
          </div>
        ) : pets.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Dog size={48} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">No pets added yet</p>
            <Button onClick={() => onNavigate(AppView.PETS)} className="bg-familiar-500 hover:bg-familiar-600">
              <Plus size={18} className="mr-2" /> Add Your First Pet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pets.slice(0, 6).map((pet) => (
              <button
                key={pet.id}
                onClick={() => onNavigate(AppView.PETS)}
                className="bg-card rounded-2xl p-4 border border-border hover:border-familiar-300 hover:shadow-md transition-all text-left group"
              >
                <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl">
                  <img
                    src={pet.avatar_url || `https://picsum.photos/seed/${pet.id}/200`}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200')}
                  />
                </div>
                <h3 className="font-bold text-foreground truncate">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">{pet.type} • {pet.age}y</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Reminders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar size={22} className="text-familiar-500" />
            Upcoming Tasks
          </h2>
          <button
            onClick={() => onNavigate(AppView.REMINDERS)}
            className="text-sm text-familiar-500 hover:text-familiar-600 flex items-center gap-1"
          >
            View all <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-familiar-500 border-t-transparent rounded-full" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Calendar size={48} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">No upcoming tasks</p>
            <Button onClick={() => onNavigate(AppView.REMINDERS)} className="bg-familiar-500 hover:bg-familiar-600">
              <Plus size={18} className="mr-2" /> Add a Task
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {reminders.map((reminder, idx) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-4 p-4 ${idx !== reminders.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-familiar-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-familiar-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{reminder.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reminder.date), 'MMM d, h:mm a')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDateColor(reminder.date)}`}>
                  {getDateLabel(reminder.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Theme Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>✨ Theme colors change daily to keep things fresh!</p>
      </div>
    </div>
  );
};

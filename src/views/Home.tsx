import React, { useState, useEffect } from 'react';
import { Dog, Calendar, Plus, Clock, ChevronRight, MapPin, Stethoscope, UtensilsCrossed, ClipboardList, Lightbulb, CheckCircle2, Circle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { AppView } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

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

const petTips = [
  "🐾 Regular nail trimming prevents joint problems in dogs and cats.",
  "💧 Cats need fresh water daily — try a fountain to encourage drinking.",
  "🦴 Chew toys help keep your dog's teeth clean and reduce anxiety.",
  "🐱 Cats sleep 12–16 hours a day — make sure they have a cozy spot.",
  "🐕 A tired dog is a happy dog — aim for 30+ minutes of exercise daily.",
  "🐦 Birds need mental stimulation — rotate toys weekly to keep them engaged.",
  "🐾 Regular vet checkups catch health issues early — schedule biannual visits.",
  "🥕 Some human foods are toxic to pets — always check before sharing snacks.",
];

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [allTodayReminders, setAllTodayReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [todayTip] = useState(() => petTips[new Date().getDate() % petTips.length]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [petsRes, remindersRes, todayRes, profileRes] = await Promise.all([
        supabase.from('pets').select('*').order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('is_completed', false).order('date', { ascending: true }).limit(5),
        supabase.from('reminders').select('*').gte('date', new Date(new Date().setHours(0,0,0,0)).toISOString()).lte('date', new Date(new Date().setHours(23,59,59,999)).toISOString()).order('date', { ascending: true }),
        supabase.from('profiles').select('display_name').eq('user_id', user.id).single(),
      ]);

      if (petsRes.data) setPets(petsRes.data);
      if (remindersRes.data) setReminders(remindersRes.data);
      if (todayRes.data) setAllTodayReminders(todayRes.data);
      if (profileRes.data?.display_name) setDisplayName(profileRes.data.display_name);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleTask = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reminders').update({ is_completed: !current }).eq('id', id);
    if (!error) {
      setAllTodayReminders(prev => prev.map(r => r.id === id ? { ...r, is_completed: !current } : r));
      if (!current) setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-destructive bg-destructive/10';
    if (isToday(date)) return 'text-amber-600 bg-amber-50';
    return 'text-muted-foreground bg-muted';
  };

  const todayCompleted = allTodayReminders.filter(r => r.is_completed).length;
  const todayTotal = allTodayReminders.length;
  const todayProgress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

  const quickActions = [
    { icon: Plus, label: 'Add Pet', color: 'bg-familiar-100 text-familiar-600', action: () => onNavigate(AppView.PETS) },
    { icon: UtensilsCrossed, label: 'Log Meal', color: 'bg-amber-100 text-amber-600', action: () => onNavigate(AppView.PETS) },
    { icon: ClipboardList, label: 'Add Task', color: 'bg-blue-100 text-blue-600', action: () => onNavigate(AppView.REMINDERS) },
    { icon: Stethoscope, label: 'Find Vet', color: 'bg-emerald-100 text-emerald-600', action: () => onNavigate(AppView.NEARBY) },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-familiar-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-[hsl(var(--purple-start))] to-[hsl(var(--purple-end))] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FamiliarLogo className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{getGreeting()}, {displayName || 'there'}</h1>
              <p className="text-white/70 text-sm">
                {pets.length > 0 
                  ? `You have ${pets.length} pet${pets.length > 1 ? 's' : ''} and ${reminders.length} task${reminders.length !== 1 ? 's' : ''} today.`
                  : 'Get started by adding your first pet!'}
              </p>
            </div>
          </div>

          <Button 
            onClick={() => onNavigate(AppView.PETS)}
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 mt-2"
          >
            <Dog size={16} className="mr-1.5" />
            {pets.length > 0 ? 'Manage Pets' : 'Add Your Pet'}
          </Button>
        </div>
      </div>

      {/* Today's Tasks */}
      {todayTotal > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar size={20} className="text-familiar-500" />
              Today's Tasks
            </h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {todayCompleted}/{todayTotal} done
            </span>
          </div>
          <Progress value={todayProgress} className="h-2 mb-3 rounded-full" />
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {allTodayReminders.map((task, idx) => (
              <button
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.is_completed)}
                className={`flex items-center gap-3 p-3.5 w-full text-left transition-colors hover:bg-muted/50 ${idx !== allTodayReminders.length - 1 ? 'border-b border-border' : ''}`}
              >
                {task.is_completed 
                  ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                  : <Circle size={20} className="text-muted-foreground flex-shrink-0" />
                }
                <span className={`text-sm flex-1 ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.date), 'h:mm a')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Pets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Dog size={20} className="text-familiar-500" />
            My Pets
          </h2>
          {pets.length > 0 && (
            <button onClick={() => onNavigate(AppView.PETS)} className="text-xs text-familiar-500 hover:text-familiar-600 flex items-center gap-0.5 font-medium">
              View all <ChevronRight size={14} />
            </button>
          )}
        </div>

        {pets.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <Dog size={40} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No pets added yet</p>
            <Button size="sm" onClick={() => onNavigate(AppView.PETS)} className="bg-familiar-500 hover:bg-familiar-600">
              <Plus size={16} className="mr-1.5" /> Add Pet
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {pets.slice(0, 8).map((pet) => (
              <button
                key={pet.id}
                onClick={() => onNavigate(AppView.PETS)}
                className="bg-card rounded-2xl border border-border hover:border-familiar-300 hover:shadow-md transition-all flex-shrink-0 w-[140px] overflow-hidden group"
              >
                <div className="w-full h-[100px] overflow-hidden">
                  <img
                    src={pet.avatar_url || `https://picsum.photos/seed/${pet.id}/200`}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200')}
                  />
                </div>
                <div className="p-2.5">
                  <h3 className="font-semibold text-sm text-foreground truncate">{pet.name}</h3>
                  <p className="text-xs text-muted-foreground">{pet.type} • {pet.age}y</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={qa.action}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border hover:shadow-md transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-xl ${qa.color} flex items-center justify-center`}>
                <qa.icon size={20} />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight text-center">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      {reminders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock size={20} className="text-familiar-500" />
              Upcoming
            </h2>
            <button onClick={() => onNavigate(AppView.REMINDERS)} className="text-xs text-familiar-500 hover:text-familiar-600 flex items-center gap-0.5 font-medium">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {reminders.slice(0, 4).map((reminder, idx) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-3 p-3.5 ${idx !== Math.min(reminders.length, 4) - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-familiar-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-familiar-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(reminder.date), 'MMM d, h:mm a')}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getDateColor(reminder.date)}`}>
                  {getDateLabel(reminder.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Pet Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin size={20} className="text-familiar-500" />
            Nearby Services
          </h2>
          <button onClick={() => onNavigate(AppView.NEARBY)} className="text-xs text-familiar-500 hover:text-familiar-600 flex items-center gap-0.5 font-medium">
            Explore <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          {[
            { icon: Stethoscope, label: 'Vets', query: 'veterinary+clinic+near+me' },
            { icon: Store, label: 'Pet Stores', query: 'pet+store+near+me' },
            { icon: Dog, label: 'Grooming', query: 'pet+grooming+near+me' },
          ].map((item) => (
            <a
              key={item.label}
              href={`https://www.google.com/maps/search/${item.query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <item.icon size={18} className="text-emerald-600" />
              </div>
              <span className="text-[11px] font-medium text-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Pet Tip of the Day */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-0.5">Pet Tip of the Day</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{todayTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

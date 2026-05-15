import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Sparkles, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TaskCard } from '@/components/gamification/TaskCard';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useGamification } from '@/hooks/useGamification';
import { Button } from '@/components/ui/button';
import { CATEGORY_XP } from '@/lib/gamification';
import type { TaskCategory } from '@/lib/taskEngine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PetLite { id: string; name: string; type: string; avatar_url?: string }

const CATS: TaskCategory[] = ['feeding','walk','medicine','grooming','hydration','litter','play','training','other'];

export const Tasks: React.FC = () => {
  const [pets, setPets] = useState<PetLite[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [userId, setUserId] = useState<string | undefined>();
  const [filter, setFilter] = useState<TaskCategory | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'feeding' as TaskCategory, time: '' });
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from('pets').select('id, name, type, avatar_url').order('created_at');
      if (data) setPets(data as PetLite[]);
    })();
  }, []);

  const activePet = pets[activeIdx];
  const { tasks, reload, loading } = useDailyTasks(userId, activePet?.id, activePet?.type);
  const { data: gam, reload: reloadGam } = useGamification(userId);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);
  const completed = tasks.filter(t => t.completed).length;

  const handleCreate = async () => {
    if (!userId || !activePet || !form.title.trim()) return;
    await supabase.from('pet_tasks').insert({
      user_id: userId,
      pet_id: activePet.id,
      title: form.title,
      category: form.category,
      xp_reward: CATEGORY_XP[form.category],
      recurrence: 'daily',
      time_of_day: form.time || null,
      is_active: true,
    });
    setForm({ title: '', category: 'feeding', time: '' });
    setOpen(false);
    toast({ title: 'Task added' });
    reload();
  };

  if (pets.length === 0) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-5xl">🐾</div>
        <h1 className="text-xl font-bold">No pets yet</h1>
        <p className="text-sm text-muted-foreground">Add a pet first to start daily care tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ListChecks className="text-familiar-500" /> Daily Tasks
            </h1>
            <p className="text-sm text-muted-foreground">{completed} of {tasks.length} done today · +{tasks.filter(t=>t.completed).reduce((s,t)=>s+t.xp_reward,0)} XP earned</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus size={16} />New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a daily task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Brush teeth" /></div>
                <div className="space-y-1.5"><Label>Category</Label>
                  <Select value={form.category} onValueChange={v=>setForm({...form,category:v as TaskCategory})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Time (optional)</Label><Input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} /></div>
                <Button onClick={handleCreate} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {pets.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActiveIdx(i)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i===activeIdx ? 'bg-familiar-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter==='all'?'bg-foreground text-background':'bg-muted text-muted-foreground'}`}>All</button>
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize ${filter===c?'bg-foreground text-background':'bg-muted text-muted-foreground'}`}>{c}</button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed p-10 text-center space-y-2">
          <Sparkles size={28} className="mx-auto text-familiar-500" />
          <p className="text-sm font-medium">All caught up here!</p>
          <p className="text-xs text-muted-foreground">No tasks for this filter today.</p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => (
            <TaskCard key={t.id} task={t} onComplete={() => { reload(); reloadGam(); }} />
          ))}
        </div>
      )}

      {gam && (
        <div className="rounded-2xl glass p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Level {gam.level} · {gam.totalXp} XP · {gam.totalCompletions} tasks completed</p>
        </div>
      )}
    </div>
  );
};

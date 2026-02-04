import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { ReminderItem } from '@/components/ReminderItem';

interface Reminder {
  id: string;
  title: string;
  date: string;
  is_completed: boolean;
  pet_id: string | null;
}

interface Pet {
  id: string;
  name: string;
}

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', pet_id: '' });
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    
    const [remindersRes, petsRes] = await Promise.all([
      supabase.from('reminders').select('*').order('date', { ascending: true }),
      supabase.from('pets').select('id, name'),
    ]);

    if (remindersRes.error) console.error('Error fetching reminders:', remindersRes.error);
    else setReminders(remindersRes.data || []);

    if (petsRes.error) console.error('Error fetching pets:', petsRes.error);
    else setPets(petsRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('reminders').insert({
      title: formData.title,
      date: formData.date,
      pet_id: formData.pet_id || null,
      user_id: user.id,
    });

    if (error) {
      addToast('Failed to add reminder', 'error');
    } else {
      addToast('Reminder added!', 'success');
      fetchData();
      setShowForm(false);
      setFormData({ title: '', date: '', pet_id: '' });
    }
  };

  const handleToggle = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: !reminder.is_completed })
      .eq('id', id);

    if (error) {
      addToast('Failed to update reminder', 'error');
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) {
      addToast('Failed to delete reminder', 'error');
    } else {
      addToast('Reminder deleted', 'info');
      fetchData();
    }
  };

  const getPetName = (petId: string | null) => {
    if (!petId) return 'General';
    return pets.find(p => p.id === petId)?.name || 'Unknown';
  };

  const pendingReminders = reminders.filter(r => !r.is_completed);
  const completedReminders = reminders.filter(r => r.is_completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-familiar-500" size={28} />
            Tasks & Reminders
          </h1>
          <p className="text-gray-500 mt-1">Keep track of pet care tasks</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-familiar-500 hover:bg-familiar-600"
        >
          <Plus size={20} className="mr-1" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Add New Reminder</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Reminder title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <select
              value={formData.pet_id}
              onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">General (no pet)</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="submit" className="bg-familiar-500 hover:bg-familiar-600">Add</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-familiar-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No reminders yet. Add your first task!</p>
        </div>
      ) : (
        <>
          {pendingReminders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Pending ({pendingReminders.length})</h3>
              {pendingReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  petName={getPetName(reminder.pet_id)}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {completedReminders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-500">Completed ({completedReminders.length})</h3>
              {completedReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  petName={getPetName(reminder.pet_id)}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

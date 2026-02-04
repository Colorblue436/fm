import React, { useState, useEffect } from 'react';
import { Plus, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { PetCard } from '@/components/PetCard';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  avatar_url?: string;
  favorite_toys?: string[];
  notes?: string;
  status?: string;
}

export const PetManagement: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Dog', breed: '', age: 1 });
  const { addToast } = useToast();

  const fetchPets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      addToast('Failed to load pets', 'error');
    } else {
      setPets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingPet) {
      const { error } = await supabase
        .from('pets')
        .update(formData)
        .eq('id', editingPet.id);

      if (error) {
        addToast('Failed to update pet', 'error');
      } else {
        addToast('Pet updated!', 'success');
        setEditingPet(null);
        fetchPets();
      }
    } else {
      const { error } = await supabase
        .from('pets')
        .insert({ ...formData, user_id: user.id });

      if (error) {
        addToast('Failed to add pet', 'error');
      } else {
        addToast('Pet added! 🐾', 'success');
        fetchPets();
      }
    }

    setShowForm(false);
    setFormData({ name: '', type: 'Dog', breed: '', age: 1 });
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({ name: pet.name, type: pet.type, breed: pet.breed || '', age: pet.age });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Dog className="text-familiar-500" size={28} />
            My Pets
          </h1>
          <p className="text-gray-500 mt-1">Manage your pet profiles</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingPet(null); setFormData({ name: '', type: 'Dog', breed: '', age: 1 }); }}
          className="bg-familiar-500 hover:bg-familiar-600"
        >
          <Plus size={20} className="mr-1" />
          Add Pet
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{editingPet ? 'Edit Pet' : 'Add New Pet'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Pet name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
              <option value="Other">Other</option>
            </select>
            <Input
              placeholder="Breed (optional)"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Age (years)"
              min={0}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-familiar-500 hover:bg-familiar-600">
                {editingPet ? 'Update' : 'Add Pet'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPet(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-familiar-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Dog className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No pets yet. Add your first pet!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onEdit={handleEdit} onDelete={fetchPets} />
          ))}
        </div>
      )}
    </div>
  );
};

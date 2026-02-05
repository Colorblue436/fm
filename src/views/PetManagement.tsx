import React, { useState, useEffect } from 'react';
import { Plus, Dog, Camera, X } from 'lucide-react';
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
  const [formData, setFormData] = useState({ name: '', type: 'Dog', breed: '', age: 1, avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string, petId: string): Promise<string | null> => {
    if (!avatarFile) return formData.avatar_url || null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${petId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (editingPet?.avatar_url) {
        const oldPath = editingPet.avatar_url.split('/pet-media/')[1];
        if (oldPath) {
          await supabase.storage.from('pet-media').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Avatar upload error:', err);
      addToast('Failed to upload avatar', 'error');
      return null;
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Dog', breed: '', age: 1, avatar_url: '' });
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowForm(false);
    setEditingPet(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    if (editingPet) {
      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, editingPet.id) || avatarUrl;
      }

      const { error } = await supabase
        .from('pets')
        .update({ ...formData, avatar_url: avatarUrl })
        .eq('id', editingPet.id);

      if (error) {
        addToast('Failed to update pet', 'error');
      } else {
        addToast('Pet updated!', 'success');
        resetForm();
        fetchPets();
      }
    } else {
      // First create pet without avatar
      const { data: newPet, error } = await supabase
        .from('pets')
        .insert({ name: formData.name, type: formData.type, breed: formData.breed || null, age: formData.age, user_id: user.id })
        .select()
        .single();

      if (error) {
        addToast('Failed to add pet', 'error');
      } else if (newPet) {
        // Upload avatar if provided
        if (avatarFile) {
          const avatarUrl = await uploadAvatar(user.id, newPet.id);
          if (avatarUrl) {
            await supabase
              .from('pets')
              .update({ avatar_url: avatarUrl })
              .eq('id', newPet.id);
          }
        }
        addToast('Pet added! 🐾', 'success');
        resetForm();
        fetchPets();
      }
    }

    setUploading(false);
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({ name: pet.name, type: pet.type, breed: pet.breed || '', age: pet.age, avatar_url: pet.avatar_url || '' });
    setAvatarPreview(pet.avatar_url || null);
    setAvatarFile(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Dog className="text-familiar-500" size={28} />
            My Pets
          </h1>
          <p className="text-muted-foreground mt-1">Manage your pet profiles</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingPet(null); setFormData({ name: '', type: 'Dog', breed: '', age: 1, avatar_url: '' }); setAvatarFile(null); setAvatarPreview(null); }}
          className="bg-familiar-500 hover:bg-familiar-600"
        >
          <Plus size={20} className="mr-1" />
          Add Pet
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-foreground">{editingPet ? 'Edit Pet' : 'Add New Pet'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Pet avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-muted-foreground" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-familiar-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-familiar-600 transition-colors">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); setFormData({ ...formData, avatar_url: '' }); }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  >
                    <X size={12} className="text-destructive-foreground" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Tap to add a photo</p>

            <Input
              placeholder="Pet name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
              <Button type="submit" className="bg-familiar-500 hover:bg-familiar-600" disabled={uploading}>
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : (
                  editingPet ? 'Update' : 'Add Pet'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
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
        <div className="text-center py-12 bg-muted rounded-2xl">
          <Dog className="mx-auto text-muted-foreground/40 mb-3" size={48} />
          <p className="text-muted-foreground">No pets yet. Add your first pet!</p>
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

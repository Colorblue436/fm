import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ChevronDown, Syringe, Gamepad2, StickyNote, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';

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

interface Vaccination {
  id: string;
  name: string;
  date: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete?: () => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const isDog = pet.type === 'Dog';

  useEffect(() => {
    const fetchVaccinations = async () => {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', pet.id)
        .order('date', { ascending: false });

      if (!error && data) setVaccinations(data);
    };
    fetchVaccinations();
  }, [pet.id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${pet.name}?`)) return;
    setIsDeleting(true);

    try {
      await supabase.from('vaccinations').delete().eq('pet_id', pet.id);
      const { error } = await supabase.from('pets').delete().eq('id', pet.id);
      if (error) throw error;
      addToast(`${pet.name} has been removed`, 'info');
      if (onDelete) onDelete();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete pet', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
      <div className="p-4 flex items-center gap-4 relative">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            loading="lazy"
            src={pet.avatar_url || `https://picsum.photos/seed/${pet.id}/200`}
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200')}
            alt={`${pet.name} avatar`}
            className="w-full h-full object-cover rounded-xl"
          />
          <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-lg border-2 border-white ${
            isDog ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
          }`}>
            {pet.type}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
            {pet.name}
            {pet.status === 'in_care' && (
              <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <HeartHandshake size={10} /> In care
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500">{pet.breed || 'Unknown Breed'}</p>
          <p className="text-sm text-gray-400">{pet.age} {pet.age === 1 ? 'year' : 'years'} old</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            aria-label={`Edit ${pet.name}`}
            onClick={() => onEdit(pet)}
            className="p-2 text-gray-400 hover:bg-gray-50 hover:text-familiar-500 rounded-full transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            aria-label={`Delete ${pet.name}`}
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1 text-xs font-medium text-gray-500 transition-colors border-t border-gray-100"
      >
        {isExpanded ? 'Hide Details' : 'View Details'}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <div
        style={{ maxHeight: isExpanded ? '1000px' : '0px', transition: 'max-height 0.35s ease' }}
        className="overflow-hidden bg-gray-50/50 border-t border-gray-100 px-4"
      >
        <div className="py-4 space-y-4">
          {pet.favorite_toys && pet.favorite_toys.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Gamepad2 size={14} /> Favorites
              </div>
              <div className="flex flex-wrap gap-2">
                {pet.favorite_toys.map((toy, idx) => (
                  <span key={idx} className="bg-familiar-100 text-familiar-700 text-xs px-2 py-1 rounded-md font-medium">
                    {toy}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Syringe size={14} /> Vaccinations
            </div>
            {vaccinations.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {vaccinations.map((vac) => (
                  <div key={vac.id} className="flex justify-between items-center p-2 text-sm border-b last:border-0 border-gray-100">
                    <span className="font-medium text-gray-700">{vac.name}</span>
                    <span className="text-gray-500 text-xs">
                      {vac.date ? format(new Date(vac.date), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No records added.</p>
            )}
          </div>

          {pet.notes && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <StickyNote size={14} /> Notes
              </div>
              <div className="bg-yellow-50 text-yellow-900 p-3 rounded-xl text-sm border border-yellow-100 italic">
                "{pet.notes}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

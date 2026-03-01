import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { format } from 'date-fns';

interface Vaccination {
  id: string;
  name: string;
  date: string | null;
  next_due: string | null;
}

interface VaccinationManagerProps {
  petId: string;
  petName: string;
  vaccinations: Vaccination[];
  onUpdate: () => void;
}

export const VaccinationManager: React.FC<VaccinationManagerProps> = ({
  petId,
  petName,
  vaccinations,
  onUpdate,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', date: '', next_due: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const resetForm = () => {
    setFormData({ name: '', date: '', next_due: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('vaccinations').insert({
      pet_id: petId,
      name: formData.name,
      date: formData.date || null,
      next_due: formData.next_due || null,
    });
    if (error) {
      addToast('Failed to add vaccination', 'error');
    } else {
      addToast('Vaccination added', 'success');
      resetForm();
      onUpdate();
    }
    setSaving(false);
  };

  const handleEdit = (vac: Vaccination) => {
    setEditingId(vac.id);
    setFormData({
      name: vac.name,
      date: vac.date || '',
      next_due: vac.next_due || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('vaccinations')
      .update({
        name: formData.name,
        date: formData.date || null,
        next_due: formData.next_due || null,
      })
      .eq('id', editingId);
    if (error) {
      addToast('Failed to update', 'error');
    } else {
      addToast('Vaccination updated', 'success');
      resetForm();
      onUpdate();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('vaccinations').delete().eq('id', id);
    if (error) {
      addToast('Failed to delete', 'error');
    } else {
      addToast('Vaccination removed', 'info');
      onUpdate();
    }
  };

  const renderForm = (isEdit: boolean) => (
    <div className="bg-muted/50 rounded-xl p-3 space-y-2 border border-border">
      <Input
        placeholder="Vaccine name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-bold">Date Given</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-bold">Next Due</label>
          <Input
            type="date"
            value={formData.next_due}
            onChange={(e) => setFormData({ ...formData, next_due: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-familiar-500 hover:bg-familiar-600"
          onClick={isEdit ? handleUpdate : handleAdd}
          disabled={saving}
        >
          <Check size={14} className="mr-1" />
          {isEdit ? 'Update' : 'Add'}
        </Button>
        <Button size="sm" variant="outline" onClick={resetForm} disabled={saving}>
          <X size={14} className="mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Syringe size={14} /> Vaccinations
        </div>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-familiar-500 hover:text-familiar-600 font-medium flex items-center gap-1"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {showForm && renderForm(false)}

      {vaccinations.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {vaccinations.map((vac) =>
            editingId === vac.id ? (
              <div key={vac.id} className="p-2">
                {renderForm(true)}
              </div>
            ) : (
              <div
                key={vac.id}
                className="flex justify-between items-center p-2.5 text-sm border-b last:border-0 border-border group"
              >
                <div>
                  <span className="font-medium text-foreground">{vac.name}</span>
                  <div className="text-[10px] text-muted-foreground">
                    {vac.date ? format(new Date(vac.date), 'MMM d, yyyy') : 'No date'}
                    {vac.next_due && (
                      <span className="ml-2 text-familiar-600">
                        Due: {format(new Date(vac.next_due), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(vac)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-familiar-500"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(vac.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        !showForm && (
          <p className="text-xs text-muted-foreground italic">No records added.</p>
        )
      )}
    </div>
  );
};

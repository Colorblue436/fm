import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { AppView } from '@/types';

interface ProfileData {
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface ProfileProps {
  onNavigate?: (view: AppView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: '', bio: '' });
  const { addToast } = useToast();

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFormData({ display_name: data.display_name || '', bio: data.bio || '' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('user_id', user.id);

    if (error) {
      addToast('Failed to update profile', 'error');
    } else {
      addToast('Profile updated!', 'success');
      setEditing(false);
      fetchProfile();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-familiar-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <User className="text-familiar-500" size={28} />
          Profile
        </h1>
        <p className="text-zinc-400 mt-1">Manage your account</p>
      </div>

      <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-familiar-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300 hover:bg-zinc-600 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            {editing ? (
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Display name"
              />
            ) : (
              <>
                <h2 className="text-xl font-bold text-zinc-100">{profile?.display_name || 'User'}</h2>
                <p className="text-zinc-400 text-sm">{profile?.bio || 'No bio yet'}</p>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="text-zinc-400 hover:text-white"
          >
            <Edit2 size={18} />
          </Button>
        </div>

        {editing && (
          <div className="space-y-4">
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 resize-none"
              placeholder="Write a short bio..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-familiar-500 hover:bg-familiar-600">Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="border-zinc-600 text-zinc-300">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => onNavigate?.(AppView.SETTINGS)}
        className="w-full"
      >
        <Settings size={18} className="mr-2" />
        Settings
      </Button>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <LogOut size={18} className="mr-2" />
        Logout
      </Button>
    </div>
  );
};

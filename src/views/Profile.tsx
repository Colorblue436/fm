import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera, LogOut, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';

interface ProfileData {
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface ProfileProps {
  userRole?: 'visitor' | 'pet_parent' | null;
  onUpgrade?: () => void;
  onLogout?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userRole, onUpgrade, onLogout }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: '', bio: '' });
  const [upgrading, setUpgrading] = useState(false);
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
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const handleUpgrade = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUpgrading(true);
    try {
      // Update user role to pet_parent
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'pet_parent' })
        .eq('user_id', user.id);

      if (error) throw error;

      addToast('Upgraded to Pet Parent! 🐾', 'success');
      if (onUpgrade) onUpgrade();
    } catch (error) {
      addToast('Failed to upgrade', 'error');
    } finally {
      setUpgrading(false);
    }
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-familiar-500" size={28} />
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-familiar-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            {editing ? (
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="bg-muted border-border"
                placeholder="Display name"
              />
            ) : (
              <>
                <h2 className="text-xl font-bold">{profile?.display_name || 'User'}</h2>
                <p className="text-muted-foreground text-sm">{profile?.bio || 'No bio yet'}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    userRole === 'pet_parent' 
                      ? 'bg-familiar-100 text-familiar-700' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {userRole === 'pet_parent' ? '🐾 Pet Parent' : '👀 Visitor'}
                  </span>
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 size={18} />
          </Button>
        </div>

        {editing && (
          <div className="space-y-4">
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 bg-muted border border-border rounded-xl placeholder:text-muted-foreground resize-none"
              placeholder="Write a short bio..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-familiar-500 hover:bg-familiar-600">Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade to Pet Parent - only for visitors */}
      {userRole === 'visitor' && (
        <div className="bg-gradient-to-r from-familiar-500 to-familiar-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                Become a Pet Parent
                <Sparkles size={16} />
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Unlock pet profiles, reminders, AI assistant, and more!
              </p>
              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="mt-4 bg-white text-familiar-600 hover:bg-white/90"
              >
                {upgrading ? 'Upgrading...' : (
                  <>
                    Upgrade Now
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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

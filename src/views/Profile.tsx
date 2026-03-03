import React, { useState, useEffect } from 'react';
import {
  User, Edit2, Camera, LogOut, Settings, PawPrint, Bell, Heart,
  MessageCircle, Grid3X3, Bookmark, ChevronRight, Shield, CreditCard,
  HelpCircle, Info, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { AppView } from '@/types';

interface ProfileData {
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
}

interface ProfileStats {
  pets: number;
  drops: number;
  posts: number;
}

interface ProfileProps {
  onNavigate?: (view: AppView) => void;
}

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  destructive?: boolean;
}> = ({ icon, label, description, onClick, destructive }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent/60 transition-colors group"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className={`text-sm font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
  </button>
);

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ pets: 0, drops: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: '', bio: '' });
  const [userEmail, setUserEmail] = useState('');
  const { addToast } = useToast();

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email || '');

    const [profileRes, petsRes, dropsRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('pets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('drops').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    if (!profileRes.error && profileRes.data) {
      setProfile(profileRes.data);
      setFormData({ display_name: profileRes.data.display_name || '', bio: profileRes.data.bio || '' });
    }

    setStats({
      pets: petsRes.count || 0,
      drops: dropsRes.count || 0,
      posts: postsRes.count || 0,
    });

    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update(formData).eq('user_id', user.id);
    if (error) addToast('Failed to update profile', 'error');
    else {
      addToast('Profile updated!', 'success');
      setEditing(false);
      fetchProfile();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Familiar Profile', text: `Check out ${profile?.display_name || 'my'} profile on Familiar!` });
    } else {
      addToast('Profile link copied!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">{profile?.display_name || 'Profile'}</h1>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <Share2 size={20} className="text-foreground" />
          </button>
          <button onClick={() => onNavigate?.(AppView.SETTINGS)} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <Settings size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Profile Header - Instagram style */}
      <div className="flex items-center gap-5 mb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl md:text-3xl font-bold ring-2 ring-border ring-offset-2 ring-offset-background">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile?.display_name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <button className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground border-2 border-background">
            <Camera size={13} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex-1 flex justify-around">
          <button onClick={() => onNavigate?.(AppView.PETS)} className="flex flex-col items-center gap-0.5 group">
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{stats.pets}</span>
            <span className="text-xs text-muted-foreground">Pets</span>
          </button>
          <button onClick={() => onNavigate?.(AppView.DROPS)} className="flex flex-col items-center gap-0.5 group">
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{stats.drops}</span>
            <span className="text-xs text-muted-foreground">Drops</span>
          </button>
          <button onClick={() => onNavigate?.(AppView.COMMUNITY)} className="flex flex-col items-center gap-0.5 group">
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{stats.posts}</span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </button>
        </div>
      </div>

      {/* Name & Bio */}
      <div className="mb-4">
        {editing ? (
          <div className="space-y-3 bg-card rounded-2xl border border-border p-4">
            <Input
              value={formData.display_name}
              onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))}
              placeholder="Display name"
            />
            <textarea
              value={formData.bio}
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Write a short bio..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">Save</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">{profile?.display_name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.bio || 'No bio yet'}</p>
            <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
          </>
        )}
      </div>

      {/* Action Buttons - Instagram style */}
      {!editing && (
        <div className="flex gap-2 mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
            className="flex-1 font-semibold"
          >
            <Edit2 size={14} className="mr-1.5" />
            Edit Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="flex-1 font-semibold"
          >
            <Share2 size={14} className="mr-1.5" />
            Share Profile
          </Button>
        </div>
      )}

      {/* Menu Items - YouTube channel style */}
      <div className="space-y-1">
        <div className="px-1 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Content</p>
        </div>
        <MenuItem icon={<PawPrint size={18} />} label="My Pets" description={`${stats.pets} pets`} onClick={() => onNavigate?.(AppView.PETS)} />
        <MenuItem icon={<Grid3X3 size={18} />} label="My Drops" description={`${stats.drops} drops`} onClick={() => onNavigate?.(AppView.DROPS)} />
        <MenuItem icon={<MessageCircle size={18} />} label="My Posts" description={`${stats.posts} posts`} onClick={() => onNavigate?.(AppView.COMMUNITY)} />
        <MenuItem icon={<Bell size={18} />} label="Reminders" onClick={() => onNavigate?.(AppView.REMINDERS)} />
        <MenuItem icon={<Bookmark size={18} />} label="Scratch Board" onClick={() => onNavigate?.(AppView.SCRATCH_BOARD)} />

        <div className="px-1 pt-5 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
        </div>
        <MenuItem icon={<Settings size={18} />} label="Settings" description="App preferences & config" onClick={() => onNavigate?.(AppView.SETTINGS)} />
        <MenuItem icon={<Shield size={18} />} label="Privacy & Security" onClick={() => onNavigate?.(AppView.SETTINGS)} />
        <MenuItem icon={<CreditCard size={18} />} label="Subscription" description="Free Plan" onClick={() => onNavigate?.(AppView.SETTINGS)} />
        <MenuItem icon={<HelpCircle size={18} />} label="Help & Support" onClick={() => addToast('Help center coming soon', 'info')} />
        <MenuItem icon={<Info size={18} />} label="About Familiar" onClick={() => addToast('Familiar v1.0', 'info')} />

        <div className="pt-3">
          <MenuItem icon={<LogOut size={18} />} label="Log Out" onClick={handleLogout} destructive />
        </div>
      </div>
    </div>
  );
};

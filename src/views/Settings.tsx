import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, User, Bot, PawPrint, MapPin, Bell, Palette,
  Shield, CreditCard, ChevronDown, ChevronUp, LogOut, Trash2, Download,
  Lock, FileText, Eye, EyeOff, Save, Loader2, ArrowLeft, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UserSettings {
  assistant_name: string;
  voice_preference: string;
  language: string;
  response_length: string;
  response_style: string;
  memory_enabled: boolean;
  default_pet_type: string;
  unit_system: string;
  health_notifications: boolean;
  reminder_notifications: boolean;
  auto_location: boolean;
  default_location: string | null;
  open_in_maps: boolean;
  chat_notifications: boolean;
  vet_alerts: boolean;
  marketing_notifications: boolean;
  theme_mode: string;
  font_size: number;
  two_factor_enabled: boolean;
  subscription_plan: string;
}

const defaultSettings: UserSettings = {
  assistant_name: 'Familiar',
  voice_preference: 'system',
  language: 'en',
  response_length: 'detailed',
  response_style: 'paragraph',
  memory_enabled: true,
  default_pet_type: 'Dog',
  unit_system: 'metric',
  health_notifications: true,
  reminder_notifications: true,
  auto_location: true,
  default_location: null,
  open_in_maps: true,
  chat_notifications: true,
  vet_alerts: true,
  marketing_notifications: false,
  theme_mode: 'system',
  font_size: 16,
  two_factor_enabled: false,
  subscription_plan: 'free',
};

interface SettingSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingSection: React.FC<SettingSectionProps> = ({ icon, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-5 md:px-5 space-y-4 border-t border-border pt-4">{children}</div>}
    </div>
  );
};

const SettingRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

interface SettingsProps {
  onBack?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userCreatedAt, setUserCreatedAt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [profileForm, setProfileForm] = useState({ display_name: '', bio: '' });
  const [userId, setUserId] = useState<string | undefined>();
  const { addToast } = useToast();
  const { role, updateRole } = useUserRole(userId);

  const fetchSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email || '');
    setUserCreatedAt(user.created_at || '');

    // Fetch profile
    const { data: profile } = await supabase.from('profiles').select('display_name, bio').eq('user_id', user.id).single();
    if (profile) setProfileForm({ display_name: profile.display_name || '', bio: profile.bio || '' });

    // Fetch or create settings
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
    if (error && error.code === 'PGRST116') {
      // No settings row, create one
      const { data: newData } = await supabase.from('user_settings').insert({ user_id: user.id }).select().single();
      if (newData) {
        const { id, user_id, created_at, updated_at, ...rest } = newData;
        setSettings(rest as UserSettings);
      }
    } else if (data) {
      const { id, user_id, created_at, updated_at, ...rest } = data;
      setSettings(rest as UserSettings);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('user_settings').update({ [key]: value } as any).eq('user_id', user.id);
    if (error) {
      addToast('Failed to save setting', 'error');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from('profiles').update(profileForm).eq('user_id', user.id);
    setSaving(false);
    if (error) addToast('Failed to update profile', 'error');
    else addToast('Profile updated!', 'success');
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.new.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setSaving(false);
    if (error) addToast(error.message, 'error');
    else {
      addToast('Password changed successfully!', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
  };

  const handleClearChatHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('chat_messages').delete().eq('user_id', user.id);
    if (error) addToast('Failed to clear history', 'error');
    else addToast('Chat history cleared', 'success');
  };

  const handleDownloadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profiles, pets, reminders, settings, messages] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id),
      supabase.from('pets').select('*').eq('user_id', user.id),
      supabase.from('reminders').select('*').eq('user_id', user.id),
      supabase.from('user_settings').select('*').eq('user_id', user.id),
      supabase.from('chat_messages').select('*').eq('user_id', user.id),
    ]);
    const exportData = {
      profile: profiles.data, pets: pets.data, reminders: reminders.data,
      settings: settings.data, chat_messages: messages.data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'familiar-data-export.json'; a.click();
    URL.revokeObjectURL(url);
    addToast('Data downloaded!', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action is irreversible.')) return;
    addToast('Account deletion requires contacting support', 'info');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="text-primary" size={26} />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">Manage your Familiar experience</p>
        </div>
      </div>

      {/* 1. Account */}
      <SettingSection icon={<User size={18} />} title="Account" defaultOpen>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Display Name</Label>
            <Input
              value={profileForm.display_name}
              onChange={e => setProfileForm(p => ({ ...p, display_name: e.target.value }))}
              className="mt-1"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bio</Label>
            <textarea
              value={profileForm.bio}
              onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
              className="mt-1 w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
              placeholder="Tell us about yourself..."
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={userEmail} disabled className="mt-1 opacity-60" />
          </div>
          {userCreatedAt && (
            <p className="text-xs text-muted-foreground">
              Member since {new Date(userCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="w-full">
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
            Save Profile
          </Button>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <Label className="text-xs text-muted-foreground font-semibold">Change Password</Label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={passwordForm.new}
            onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
            placeholder="New password"
          />
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.confirm}
              onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button onClick={handleChangePassword} disabled={saving} variant="outline" size="sm" className="w-full">
            <Lock size={14} className="mr-2" /> Update Password
          </Button>
        </div>

        <div className="border-t border-border pt-4 flex gap-2">
          <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut size={14} className="mr-2" /> Logout
          </Button>
          <Button onClick={handleDeleteAccount} variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 size={14} className="mr-2" /> Delete Account
          </Button>
        </div>
      </SettingSection>

      {/* 2. Assistant */}
      <SettingSection icon={<Bot size={18} />} title="Assistant Settings">
        <div>
          <Label className="text-xs text-muted-foreground">Assistant Name</Label>
          <Input
            value={settings.assistant_name}
            onChange={e => updateSetting('assistant_name', e.target.value)}
            className="mt-1"
            placeholder="Familiar"
          />
        </div>
        <SettingRow label="Voice" description="Select assistant voice">
          <Select value={settings.voice_preference} onValueChange={v => updateSetting('voice_preference', v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Language">
          <Select value={settings.language} onValueChange={v => updateSetting('language', v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Response Length">
          <Select value={settings.response_length} onValueChange={v => updateSetting('response_length', v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Response Style">
          <Select value={settings.response_style} onValueChange={v => updateSetting('response_style', v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="bullet">Bullet Points</SelectItem>
              <SelectItem value="step-by-step">Step-by-step</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="AI Memory" description="Let the assistant remember past conversations">
          <Switch checked={settings.memory_enabled} onCheckedChange={v => updateSetting('memory_enabled', v)} />
        </SettingRow>
      </SettingSection>

      {/* 3. Pet Preferences */}
      <SettingSection icon={<PawPrint size={18} />} title="Pet Preferences">
        <SettingRow label="Default Pet Type">
          <Select value={settings.default_pet_type} onValueChange={v => updateSetting('default_pet_type', v)}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="Bird">Bird</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Units" description="Weight & temperature">
          <Select value={settings.unit_system} onValueChange={v => updateSetting('unit_system', v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">kg / °C</SelectItem>
              <SelectItem value="imperial">lbs / °F</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Health Tips" description="Receive pet health tips">
          <Switch checked={settings.health_notifications} onCheckedChange={v => updateSetting('health_notifications', v)} />
        </SettingRow>
        <SettingRow label="Reminder Alerts" description="Get notified about pet reminders">
          <Switch checked={settings.reminder_notifications} onCheckedChange={v => updateSetting('reminder_notifications', v)} />
        </SettingRow>
      </SettingSection>

      {/* 4. Location */}
      <SettingSection icon={<MapPin size={18} />} title="Location">
        <SettingRow label="Auto-detect Location">
          <Switch checked={settings.auto_location} onCheckedChange={v => updateSetting('auto_location', v)} />
        </SettingRow>
        {!settings.auto_location && (
          <div>
            <Label className="text-xs text-muted-foreground">Default Location</Label>
            <Input
              value={settings.default_location || ''}
              onChange={e => updateSetting('default_location', e.target.value || null)}
              className="mt-1"
              placeholder="Enter city or address"
            />
          </div>
        )}
        <SettingRow label="Open in Google Maps" description="Use Maps for directions">
          <Switch checked={settings.open_in_maps} onCheckedChange={v => updateSetting('open_in_maps', v)} />
        </SettingRow>
      </SettingSection>

      {/* 5. Notifications */}
      <SettingSection icon={<Bell size={18} />} title="Notifications">
        <SettingRow label="Chat Notifications">
          <Switch checked={settings.chat_notifications} onCheckedChange={v => updateSetting('chat_notifications', v)} />
        </SettingRow>
        <SettingRow label="Nearby Vet Alerts">
          <Switch checked={settings.vet_alerts} onCheckedChange={v => updateSetting('vet_alerts', v)} />
        </SettingRow>
        <SettingRow label="Health Reminders">
          <Switch checked={settings.reminder_notifications} onCheckedChange={v => updateSetting('reminder_notifications', v)} />
        </SettingRow>
        <SettingRow label="Marketing" description="Promotional emails & tips">
          <Switch checked={settings.marketing_notifications} onCheckedChange={v => updateSetting('marketing_notifications', v)} />
        </SettingRow>
      </SettingSection>

      {/* 6. Appearance */}
      <SettingSection icon={<Palette size={18} />} title="Appearance">
        <SettingRow label="Theme">
          <Select value={settings.theme_mode} onValueChange={v => updateSetting('theme_mode', v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-foreground">Font Size</Label>
            <span className="text-xs text-muted-foreground font-mono">{settings.font_size}px</span>
          </div>
          <Slider
            value={[settings.font_size]}
            onValueChange={([v]) => updateSetting('font_size', v)}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
        </div>
      </SettingSection>

      {/* 7. Privacy & Security */}
      <SettingSection icon={<Shield size={18} />} title="Privacy & Security">
        <SettingRow label="Two-Factor Authentication">
          <Switch checked={settings.two_factor_enabled} onCheckedChange={v => updateSetting('two_factor_enabled', v)} />
        </SettingRow>
        <Button onClick={handleClearChatHistory} variant="outline" size="sm" className="w-full">
          <Trash2 size={14} className="mr-2" /> Clear Chat History
        </Button>
        <Button onClick={handleDownloadData} variant="outline" size="sm" className="w-full">
          <Download size={14} className="mr-2" /> Download My Data
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => addToast('Privacy Policy coming soon', 'info')}>
            <FileText size={14} className="mr-2" /> Privacy Policy
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => addToast('Terms of Service coming soon', 'info')}>
            <FileText size={14} className="mr-2" /> Terms of Service
          </Button>
        </div>
      </SettingSection>

      {/* 8. Subscription */}
      <SettingSection icon={<CreditCard size={18} />} title="Subscription">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Current Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {settings.subscription_plan === 'free' ? 'Free Plan' : 'Pro Plan'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${settings.subscription_plan === 'pro' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {settings.subscription_plan === 'pro' ? 'PRO' : 'FREE'}
          </span>
        </div>
        {settings.subscription_plan === 'free' && (
          <Button className="w-full" onClick={() => addToast('Upgrade coming soon!', 'info')}>
            Upgrade to Pro
          </Button>
        )}
        {settings.subscription_plan === 'pro' && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => addToast('Billing management coming soon', 'info')}>
            Manage Billing
          </Button>
        )}
      </SettingSection>
    </div>
  );
};

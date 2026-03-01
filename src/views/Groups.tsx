import React, { useState, useEffect } from 'react';
import { Grid, Users, Plus, X, Loader2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  member_count: number | null;
  is_public: boolean | null;
  owner_id: string;
  created_at: string;
  is_member?: boolean;
}

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchGroups = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      addToast('Failed to load groups', 'error');
    } else if (data && user) {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const memberGroupIds = new Set(memberships?.map(m => m.group_id) || []);
      setGroups(data.map(g => ({ ...g, is_member: memberGroupIds.has(g.id) || g.owner_id === user.id })));
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data: newGroup, error } = await supabase
      .from('groups')
      .insert({ name: formData.name, description: formData.description || null, owner_id: user.id })
      .select()
      .single();

    if (error) {
      addToast('Failed to create group', 'error');
    } else if (newGroup) {
      await supabase.from('group_members').insert({ group_id: newGroup.id, user_id: user.id, role: 'owner' });
      addToast('Group created! 🎉', 'success');
      setShowCreate(false);
      setFormData({ name: '', description: '' });
      fetchGroups();
    }
    setCreating(false);
  };

  const handleJoin = async (groupId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId });
    if (error) {
      addToast('Failed to join', 'error');
    } else {
      await supabase.from('groups').update({ member_count: (groups.find(g => g.id === groupId)?.member_count || 0) + 1 }).eq('id', groupId);
      addToast('Joined!', 'success');
      fetchGroups();
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!userId) return;
    const group = groups.find(g => g.id === groupId);
    if (group?.owner_id === userId) { addToast("Owner can't leave", 'error'); return; }

    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    await supabase.from('groups').update({ member_count: Math.max(0, (group?.member_count || 1) - 1) }).eq('id', groupId);
    addToast('Left group', 'info');
    fetchGroups();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Grid className="text-familiar-500" size={28} /> Groups
          </h1>
          <p className="text-muted-foreground mt-1">Breed groups & common interests</p>
        </div>
        <Button className="bg-familiar-500 hover:bg-familiar-600" onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-1" /> Create
        </Button>
      </div>

      {showCreate && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">New Group</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Group name (e.g. Golden Retriever Owners)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Textarea placeholder="Description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          <Button className="bg-familiar-500 hover:bg-familiar-600" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
            Create Group
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 size={32} className="animate-spin text-familiar-500 mx-auto" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-2xl">
          <Users size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No groups yet. Create one!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-familiar-400 to-familiar-600 relative">
                {group.cover_image_url && (
                  <img src={group.cover_image_url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground text-lg">{group.name}</h3>
                {group.description && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{group.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users size={12} /> {group.member_count || 0} members
                  </span>
                  {group.is_member ? (
                    <Button size="sm" variant="outline" onClick={() => handleLeave(group.id)} className="text-xs">
                      <LogOut size={12} className="mr-1" /> Leave
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-familiar-500 hover:bg-familiar-600 text-xs" onClick={() => handleJoin(group.id)}>
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

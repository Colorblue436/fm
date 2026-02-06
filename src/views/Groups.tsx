import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Grid, Users, Plus, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupDialog } from '@/components/CreateGroupDialog';

interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  owner_id: string;
  member_count: number;
  is_public: boolean;
  created_at: string;
}

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGroups(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('groups_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
        fetchGroups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Grid className="text-familiar-500" size={28} />
            Groups
          </h1>
          <p className="text-muted-foreground mt-1">Join pet communities</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-familiar-500 hover:bg-familiar-600 rounded-full"
          size="sm"
        >
          <Plus size={18} className="mr-1" />
          Create Group
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-familiar-500" size={32} />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <Users size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Groups Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Create a group to connect with pet owners who share your interests!
          </p>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-familiar-500 hover:bg-familiar-600"
          >
            <Plus size={18} className="mr-2" />
            Create Group
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex">
                {/* Cover Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-muted">
                  {group.cover_image_url ? (
                    <img 
                      src={group.cover_image_url} 
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-familiar-100">
                      <Users size={32} className="text-familiar-500" />
                    </div>
                  )}
                </div>

                {/* Group Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                    {group.is_public ? (
                      <Globe size={14} className="text-muted-foreground" />
                    ) : (
                      <Lock size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={12} />
                    <span>{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Join Button */}
                <div className="p-4 flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
};

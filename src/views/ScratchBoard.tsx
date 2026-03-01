import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Loader2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface ScratchPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'emergency';
  is_active: boolean;
  created_at: string;
  profile?: { display_name: string | null };
}

const priorityConfig = {
  emergency: { bg: 'bg-red-50 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-500 text-white', label: '🚨 Emergency' },
  important: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', badge: 'bg-amber-500 text-white', label: '⚠️ Important' },
  normal: { bg: 'bg-card border-border', icon: Info, iconColor: 'text-familiar-500', badge: 'bg-familiar-100 text-familiar-700', label: 'Notice' },
};

export const ScratchBoard: React.FC = () => {
  const [posts, setPosts] = useState<ScratchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ title: string; content: string; priority: 'normal' | 'important' | 'emergency' }>({ title: '', content: '', priority: 'normal' });
  const { addToast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data, error } = await supabase
      .from('scratch_board')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      addToast('Failed to load', 'error');
    } else if (data) {
      const enriched = await Promise.all(
        data.map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', post.user_id)
            .single();
          return { ...post, profile } as ScratchPost;
        })
      );
      setPosts(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPosting(false); return; }

    const { error } = await supabase.from('scratch_board').insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
    });

    if (error) {
      addToast('Failed to post', 'error');
    } else {
      addToast('Announcement posted! 📢', 'success');
      setShowForm(false);
      setFormData({ title: '', content: '', priority: 'normal' });
      fetchPosts();
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('scratch_board').delete().eq('id', id);
    if (error) {
      addToast('Failed to delete', 'error');
    } else {
      addToast('Post removed', 'info');
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="text-familiar-500" size={28} /> Scratch Board
          </h1>
          <p className="text-muted-foreground mt-1">Community announcements & alerts</p>
        </div>
        <Button className="bg-familiar-500 hover:bg-familiar-600" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" /> Post
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">New Announcement</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea placeholder="What do you want to announce?" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
          <div>
            <label className="text-xs text-muted-foreground font-bold uppercase mb-1 block">Priority</label>
            <div className="flex gap-2">
              {(['normal', 'important', 'emergency'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    formData.priority === p
                      ? `${priorityConfig[p].badge} shadow-sm`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Button className="bg-familiar-500 hover:bg-familiar-600" onClick={handlePost} disabled={posting}>
            {posting ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
            Post Announcement
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 size={32} className="animate-spin text-familiar-500 mx-auto" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-2xl">
          <Megaphone size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No announcements yet. Post one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const config = priorityConfig[post.priority];
            const Icon = config.icon;
            return (
              <div key={post.id} className={`rounded-2xl p-4 border ${config.bg} transition-all`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${config.iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm">{post.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-foreground/80 text-sm whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{post.profile?.display_name || 'User'}</span>
                        <span>·</span>
                        <span>{format(new Date(post.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  {post.user_id === userId && (
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

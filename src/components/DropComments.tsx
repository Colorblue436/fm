import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Send, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/context/ToastContext';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface DropCommentsProps {
  dropId: string;
  onClose: () => void;
}

export const DropComments: React.FC<DropCommentsProps> = ({ dropId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drop_comments')
      .select('*')
      .eq('drop_id', dropId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for commenters
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => {
        profileMap[p.user_id] = p;
      });

      setComments(data.map(c => ({
        ...c,
        profile: profileMap[c.user_id]
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments_${dropId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'drop_comments',
        filter: `drop_id=eq.${dropId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('drop_comments')
      .insert({
        drop_id: dropId,
        user_id: currentUserId,
        content: newComment.trim()
      });

    if (error) {
      addToast('Failed to post comment', 'error');
    } else {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Comments Sheet */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl max-h-[70vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold">Comments</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-zinc-500" size={24} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {comment.profile?.avatar_url ? (
                    <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {comment.profile?.display_name || 'User'}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-2">
          <Input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            disabled={!currentUserId}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newComment.trim() || submitting || !currentUserId}
            className="bg-familiar-500 hover:bg-familiar-600"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
};

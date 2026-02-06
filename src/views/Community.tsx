import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Heart, MessageCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPost {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  created_at: string;
}

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        fetchPosts();
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
            <Users className="text-familiar-500" size={28} />
            Community
          </h1>
          <p className="text-muted-foreground mt-1">Connect with pet lovers</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-familiar-500 hover:bg-familiar-600 rounded-full"
          size="sm"
        >
          <Plus size={18} className="mr-1" />
          Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-familiar-500" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <MessageCircle size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Be the first to share something with the community!
          </p>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-familiar-500 hover:bg-familiar-600"
          >
            <Plus size={18} className="mr-2" />
            Create Post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Post Header */}
              <div className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-familiar-100 flex items-center justify-center">
                    <Users size={18} className="text-familiar-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Community Member</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="px-4 pb-3">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {/* Post Media */}
              {post.media_url && (
                <div className="bg-muted">
                  {post.media_type === 'video' ? (
                    <video 
                      src={post.media_url} 
                      controls 
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <img 
                      src={post.media_url} 
                      alt="Post" 
                      className="w-full max-h-96 object-contain"
                    />
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4 pt-3 flex items-center gap-4 border-t border-border">
                <button className="flex items-center gap-1 text-muted-foreground hover:text-familiar-500 transition-colors">
                  <Heart size={18} />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-familiar-500 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-sm">Comment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={fetchPosts}
        type="community"
      />
    </div>
  );
};

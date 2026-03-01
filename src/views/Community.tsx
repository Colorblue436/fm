import React, { useState, useEffect } from 'react';
import { Users, Plus, Image, X, Heart, MessageCircle, Share2, MoreHorizontal, Flag, Trash2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CommunityPost {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      await fetchPosts();
    };
    init();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    // Fetch profile info for each unique user_id
    const userIds = [...new Set((data || []).map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.user_id, p])
    );

    const enriched = (data || []).map(post => ({
      ...post,
      likes_count: post.likes_count ?? 0,
      display_name: profileMap.get(post.user_id)?.display_name || 'User',
      avatar_url: profileMap.get(post.user_id)?.avatar_url || undefined,
    }));

    setPosts(enriched);
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!newContent.trim() && !imageFile) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please sign in to post', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/community/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('pet-media')
        .upload(path, imageFile);

      if (uploadError) {
        toast({ title: 'Failed to upload image', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('pet-media').getPublicUrl(path);
      mediaUrl = urlData.publicUrl;
      mediaType = 'image';
    }

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content: newContent.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
    });

    if (error) {
      toast({ title: 'Failed to create post', variant: 'destructive' });
    } else {
      setNewContent('');
      removeImage();
      setCreating(false);
      await fetchPosts();
      toast({ title: 'Post published!' });
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);
    const newLiked = new Set(likedPosts);

    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
        : p
    ));

    if (isLiked) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);

    // Update in DB
    const post = posts.find(p => p.id === postId);
    if (post) {
      await supabase
        .from('community_posts')
        .update({ likes_count: post.likes_count + (isLiked ? -1 : 1) })
        .eq('id', postId);
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post deleted' });
    }
  };

  const handleShare = async (post: CommunityPost) => {
    if (navigator.share) {
      await navigator.share({ text: post.content || 'Check out this post!' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" size={28} />
            Community
          </h1>
          <p className="text-muted-foreground mt-1">Connect with pet lovers</p>
        </div>

        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full gap-1">
              <Plus size={18} /> Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <Image size={18} />
                  Add photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting || (!newContent.trim() && !imageFile)}
                className="w-full"
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse h-32" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
          <Button onClick={() => setCreating(true)} className="rounded-full gap-1">
            <Plus size={18} /> Create Post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={currentUserId === post.user_id}
              isLiked={likedPosts.has(post.id)}
              onLike={() => handleLike(post.id)}
              onDelete={() => handleDelete(post.id)}
              onShare={() => handleShare(post)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PostCardProps {
  post: CommunityPost;
  isOwner: boolean;
  isLiked: boolean;
  onLike: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isOwner, isLiked, onLike, onDelete, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {post.avatar_url ? (
              <img src={post.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <Users size={18} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{post.display_name}</h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at))} ago
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
        </div>
      )}

      {post.media_url && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={post.media_url} className="w-full object-cover max-h-96" alt="Post" loading="lazy" />
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-1 flex items-center gap-1">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
            isLiked ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
          <span className="font-medium">{post.likes_count}</span>
        </button>
        <button onClick={onShare} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted ml-auto transition-colors">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

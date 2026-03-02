import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Plus, Play, X, Upload, Loader2, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface DropItem {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: string | null;
  thumbnail_url: string | null;
  likes_count: number | null;
  views_count: number | null;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  user_liked?: boolean;
  comments_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export const Drops: React.FC = () => {
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Comments state
  const [commentsDropId, setCommentsDropId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Double-tap like animation
  const [likeAnimDropId, setLikeAnimDropId] = useState<string | null>(null);
  const lastTapRef = useRef<{ [key: string]: number }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const fetchDrops = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      addToast('Failed to load drops', 'error');
    } else if (data) {
      const enriched = await Promise.all(
        data.map(async (drop) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', drop.user_id)
            .single();

          let user_liked = false;
          if (user) {
            const { data: like } = await supabase
              .from('drop_likes')
              .select('id')
              .eq('drop_id', drop.id)
              .eq('user_id', user.id)
              .maybeSingle();
            user_liked = !!like;
          }

          // Get comment count
          const { count } = await supabase
            .from('drop_comments')
            .select('id', { count: 'exact', head: true })
            .eq('drop_id', drop.id);

          return { ...drop, profile, user_liked, comments_count: count || 0 };
        })
      );
      setDrops(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrops();

    // Realtime: new drops
    const dropsChannel = supabase
      .channel('drops-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drops' }, async (payload) => {
        const newDrop = payload.new as any;
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', newDrop.user_id)
          .single();
        const { data: { user } } = await supabase.auth.getUser();
        let user_liked = false;
        if (user) {
          const { data: like } = await supabase
            .from('drop_likes')
            .select('id')
            .eq('drop_id', newDrop.id)
            .eq('user_id', user.id)
            .maybeSingle();
          user_liked = !!like;
        }
        setDrops(prev => {
          if (prev.some(d => d.id === newDrop.id)) return prev;
          return [{ ...newDrop, profile, user_liked, comments_count: 0 }, ...prev];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'drops' }, (payload) => {
        const deleted = payload.old as any;
        setDrops(prev => prev.filter(d => d.id !== deleted.id));
      })
      .subscribe();

    // Realtime: likes
    const likesChannel = supabase
      .channel('drop-likes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drop_likes' }, async (payload) => {
        const like = payload.new as any;
        const { data: { user } } = await supabase.auth.getUser();
        setDrops(prev =>
          prev.map(d => {
            if (d.id !== like.drop_id) return d;
            return {
              ...d,
              likes_count: (d.likes_count || 0) + 1,
              user_liked: user?.id === like.user_id ? true : d.user_liked,
            };
          })
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'drop_likes' }, async (payload) => {
        const like = payload.old as any;
        const { data: { user } } = await supabase.auth.getUser();
        setDrops(prev =>
          prev.map(d => {
            if (d.id !== like.drop_id) return d;
            return {
              ...d,
              likes_count: Math.max(0, (d.likes_count || 0) - 1),
              user_liked: user?.id === like.user_id ? false : d.user_liked,
            };
          })
        );
      })
      .subscribe();

    // Realtime: comments (update count + live comments if sheet open)
    const commentsChannel = supabase
      .channel('drop-comments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drop_comments' }, async (payload) => {
        const newComment = payload.new as any;
        setDrops(prev =>
          prev.map(d => d.id === newComment.drop_id ? { ...d, comments_count: (d.comments_count || 0) + 1 } : d)
        );
        // If comments sheet is open for this drop, add the comment
        setCommentsDropId(currentId => {
          if (currentId === newComment.drop_id) {
            (async () => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('user_id', newComment.user_id)
                .single();
              setComments(prev => {
                if (prev.some(c => c.id === newComment.id)) return prev;
                return [...prev, { ...newComment, profile } as Comment];
              });
            })();
          }
          return currentId;
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'drop_comments' }, (payload) => {
        const deleted = payload.old as any;
        setDrops(prev =>
          prev.map(d => d.id === deleted.drop_id ? { ...d, comments_count: Math.max(0, (d.comments_count || 0) - 1) } : d)
        );
        setComments(prev => prev.filter(c => c.id !== deleted.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dropsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split('.').pop();
    const path = `drops/${user.id}/${Date.now()}.${ext}`;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    const { error: uploadError } = await supabase.storage
      .from('pet-media')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      addToast('Upload failed', 'error');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('pet-media').getPublicUrl(path);

    const { error } = await supabase.from('drops').insert({
      user_id: user.id,
      title: title || null,
      description: description || null,
      media_url: publicUrl,
      media_type: mediaType,
    });

    if (error) {
      addToast('Failed to create drop', 'error');
    } else {
      addToast('Drop posted! 🎬', 'success');
      setShowUpload(false);
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      fetchDrops();
    }
    setUploading(false);
  };

  const handleLike = async (drop: DropItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const wasLiked = drop.user_liked;
    // Optimistic update
    setDrops(prev =>
      prev.map(d =>
        d.id === drop.id
          ? { ...d, user_liked: !wasLiked, likes_count: wasLiked ? Math.max(0, (d.likes_count || 0) - 1) : (d.likes_count || 0) + 1 }
          : d
      )
    );

    if (wasLiked) {
      await supabase.from('drop_likes').delete().eq('drop_id', drop.id).eq('user_id', user.id);
      await supabase.from('drops').update({ likes_count: Math.max(0, (drop.likes_count || 0) - 1) }).eq('id', drop.id);
    } else {
      await supabase.from('drop_likes').insert({ drop_id: drop.id, user_id: user.id });
      await supabase.from('drops').update({ likes_count: (drop.likes_count || 0) + 1 }).eq('id', drop.id);
    }
  };

  const handleDoubleTap = useCallback((drop: DropItem) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[drop.id] || 0;
    if (now - lastTap < 300) {
      // Double tap detected — only like if not already liked
      if (!drop.user_liked) {
        handleLike(drop);
      }
      // Show animation regardless
      setLikeAnimDropId(drop.id);
      setTimeout(() => setLikeAnimDropId(null), 900);
      lastTapRef.current[drop.id] = 0;
    } else {
      lastTapRef.current[drop.id] = now;
    }
  }, []);

  const handleShare = async (drop: DropItem) => {
    const shareData = { title: drop.title || 'Check this out!', url: drop.media_url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(drop.media_url);
      addToast('Link copied!', 'success');
    }
  };

  const handleDeleteComment = async (commentId: string, dropId: string) => {
    const { error } = await supabase.from('drop_comments').delete().eq('id', commentId);
    if (error) {
      addToast('Failed to delete comment', 'error');
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setDrops(prev =>
        prev.map(d => d.id === dropId ? { ...d, comments_count: Math.max(0, (d.comments_count || 0) - 1) } : d)
      );
    }
  };

  // Comments
  const openComments = async (dropId: string) => {
    setCommentsDropId(dropId);
    setLoadingComments(true);
    const { data } = await supabase
      .from('drop_comments')
      .select('*')
      .eq('drop_id', dropId)
      .order('created_at', { ascending: true });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (c) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', c.user_id)
            .single();
          return { ...c, profile } as Comment;
        })
      );
      setComments(enriched);
    }
    setLoadingComments(false);
  };

  const postComment = async () => {
    if (!newComment.trim() || !commentsDropId) return;
    setPostingComment(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPostingComment(false); return; }

    const { data, error } = await supabase
      .from('drop_comments')
      .insert({ drop_id: commentsDropId, user_id: user.id, content: newComment.trim() })
      .select()
      .single();

    if (!error && data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      setComments(prev => [...prev, { ...data, profile } as Comment]);
      setNewComment('');
      // Update local count
      setDrops(prev =>
        prev.map(d => d.id === commentsDropId ? { ...d, comments_count: (d.comments_count || 0) + 1 } : d)
      );
    } else {
      addToast('Failed to post comment', 'error');
    }
    setPostingComment(false);
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      setCurrentIndex(Math.round(scrollTop / height));
    }
  };

  if (showUpload) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => { setShowUpload(false); setFile(null); setPreview(null); }}>
            <X size={24} className="text-foreground" />
          </button>
          <h2 className="font-bold text-foreground">New Drop</h2>
          <Button
            size="sm"
            className="bg-familiar-500 hover:bg-familiar-600"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {preview ? (
            <div className="relative aspect-[9/16] max-h-[50vh] mx-auto rounded-2xl overflow-hidden bg-black">
              {file?.type.startsWith('video/') ? (
                <video src={preview} className="w-full h-full object-contain" controls />
              ) : (
                <img src={preview} className="w-full h-full object-contain" alt="Preview" />
              )}
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[9/16] max-h-[50vh] mx-auto rounded-2xl border-2 border-dashed border-border bg-muted/30 cursor-pointer">
              <Upload size={48} className="text-muted-foreground/40 mb-3" />
              <span className="text-sm text-muted-foreground font-medium">Tap to select video or photo</span>
              <span className="text-xs text-muted-foreground/60 mt-1">MP4, MOV, JPG, PNG</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}

          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Play className="text-familiar-500" size={24} /> Drops
        </h1>
        <Button
          size="sm"
          className="bg-familiar-500 hover:bg-familiar-600 rounded-full"
          onClick={() => setShowUpload(true)}
        >
          <Plus size={16} className="mr-1" /> Create
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 size={32} className="animate-spin text-familiar-500" />
        </div>
      ) : drops.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <Play size={64} className="text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Drops Yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Be the first to share a moment!</p>
          <Button className="bg-familiar-500 hover:bg-familiar-600" onClick={() => setShowUpload(true)}>
            <Plus size={16} className="mr-1" /> Create Drop
          </Button>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar pt-14"
        >
          {drops.map((drop, idx) => (
            <div
              key={drop.id}
              className="h-full snap-start snap-always relative flex items-center justify-center bg-black/5 rounded-2xl mb-2 overflow-hidden select-none"
              onTouchEnd={() => handleDoubleTap(drop)}
              onClick={() => handleDoubleTap(drop)}
            >
              {/* Media */}
              {drop.media_type === 'video' ? (
                <video
                  src={drop.media_url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={idx !== currentIndex}
                  autoPlay={idx === currentIndex}
                />
              ) : (
                <img
                  src={drop.media_url}
                  alt={drop.title || 'Drop'}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Double-tap like animation */}
              {likeAnimDropId === drop.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <Heart
                    size={96}
                    className="text-red-500 fill-red-500 animate-like-pop"
                  />
                </div>
              )}

              {/* Right actions */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(drop); }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${drop.user_liked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'}`}>
                    <Heart size={20} className={drop.user_liked ? 'text-white fill-white' : 'text-white'} />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">{drop.likes_count || 0}</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); openComments(drop.id); }}
                  className="flex flex-col items-center"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">{drop.comments_count || 0}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleShare(drop); }} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={20} className="text-white" />
                  </div>
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-6 left-4 right-16 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-familiar-500 overflow-hidden">
                    {drop.profile?.avatar_url ? (
                      <img src={drop.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {(drop.profile?.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {drop.profile?.display_name || 'User'}
                  </span>
                  <span className="text-white/60 text-xs">
                    {format(new Date(drop.created_at), 'MMM d')}
                  </span>
                </div>
                {drop.title && <p className="text-white font-bold text-sm">{drop.title}</p>}
                {drop.description && (
                  <p className="text-white/80 text-xs line-clamp-2 mt-1">{drop.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments Sheet */}
      {commentsDropId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setCommentsDropId(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-background rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Comments</h3>
              <button onClick={() => setCommentsDropId(null)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-familiar-500 flex-shrink-0 overflow-hidden">
                        {c.profile?.avatar_url ? (
                          <img src={c.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {(c.profile?.display_name || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {c.profile?.display_name || 'User'}
                          </span>
                          {c.created_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(c.created_at), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 mt-0.5">{c.content}</p>
                      </div>
                      {currentUserId === c.user_id && (
                        <button
                          onClick={() => commentsDropId && handleDeleteComment(c.id, commentsDropId)}
                          className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Comment input */}
            <div className="flex items-center gap-2 p-4 border-t border-border">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postComment()}
                className="flex-1"
              />
              <Button
                size="icon"
                className="bg-familiar-500 hover:bg-familiar-600 flex-shrink-0"
                onClick={postComment}
                disabled={!newComment.trim() || postingComment}
              >
                {postingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

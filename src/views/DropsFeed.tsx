import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Share2, User, Plus, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { DropComments } from '@/components/DropComments';
import { useToast } from '@/context/ToastContext';

interface Drop {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: string | null;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
}

interface DropProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export const DropsFeed: React.FC = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [profiles, setProfiles] = useState<Record<string, DropProfile>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedDrops, setLikedDrops] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const { addToast } = useToast();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Fetch drops
  const fetchDrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrops(data);
      // Fetch profiles for each unique user
      const userIds = [...new Set(data.map(d => d.user_id))];
      fetchProfiles(userIds);
    }
    setLoading(false);
  };

  const fetchProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    const { data } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    if (data) {
      const profileMap: Record<string, DropProfile> = {};
      data.forEach(p => {
        profileMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
      });
      setProfiles(profileMap);
    }
  };

  // Fetch user's liked drops
  const fetchLikedDrops = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('drop_likes')
      .select('drop_id')
      .eq('user_id', currentUserId);

    if (data) {
      setLikedDrops(new Set(data.map(l => l.drop_id)));
    }
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchLikedDrops();
    }
  }, [currentUserId]);

  // Handle scroll to change current drop
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < drops.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, drops.length]);

  // Play/pause videos based on current index
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      const dropIndex = drops.findIndex(d => d.id === id);
      if (dropIndex === currentIndex && isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, drops, isPlaying]);

  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < drops.length - 1) {
        scrollToIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
  };

  // Like functionality
  const handleLike = async (dropId: string) => {
    if (!currentUserId) {
      addToast('Please sign in to like drops', 'error');
      return;
    }

    const isLiked = likedDrops.has(dropId);

    if (isLiked) {
      await supabase
        .from('drop_likes')
        .delete()
        .eq('drop_id', dropId)
        .eq('user_id', currentUserId);

      setLikedDrops(prev => {
        const next = new Set(prev);
        next.delete(dropId);
        return next;
      });
      
      // Update local likes count
      setDrops(prev => prev.map(d => 
        d.id === dropId ? { ...d, likes_count: Math.max(0, d.likes_count - 1) } : d
      ));
    } else {
      await supabase
        .from('drop_likes')
        .insert({ drop_id: dropId, user_id: currentUserId });

      setLikedDrops(prev => new Set(prev).add(dropId));
      
      // Update local likes count
      setDrops(prev => prev.map(d => 
        d.id === dropId ? { ...d, likes_count: d.likes_count + 1 } : d
      ));
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (drops.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-6">
        <Play size={64} className="text-white/30 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Drops Yet</h2>
        <p className="text-white/60 text-center mb-6">Be the first to share a moment!</p>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-white text-black hover:bg-white/90 rounded-full px-6"
        >
          <Plus size={18} className="mr-2" />
          Create Drop
        </Button>

        <CreatePostDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchDrops}
          type="drop"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Main scrollable container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {drops.map((drop, index) => {
          const profile = profiles[drop.user_id];
          const isLiked = likedDrops.has(drop.id);

          return (
            <div
              key={drop.id}
              className="h-full w-full snap-start relative flex items-center justify-center"
            >
              {/* Media Content */}
              {drop.media_type === 'video' ? (
                <video
                  ref={el => { if (el) videoRefs.current[drop.id] = el; }}
                  src={drop.media_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={togglePlayPause}
                />
              ) : (
                <img
                  src={drop.media_url}
                  alt={drop.title || 'Drop'}
                  className="absolute inset-0 w-full h-full object-cover"
                  onClick={togglePlayPause}
                />
              )}

              {/* Play/Pause overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={40} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* Right sidebar actions */}
              <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
                {/* Profile */}
                <button className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Plus size={12} className="text-white" />
                  </div>
                </button>

                {/* Like */}
                <button onClick={() => handleLike(drop.id)} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isLiked ? 'bg-red-500/20' : 'bg-white/10'}`}>
                    <Heart 
                      size={28} 
                      className={isLiked ? 'text-red-500' : 'text-white'} 
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">{drop.likes_count}</span>
                </button>

                {/* Comments */}
                <button onClick={() => setShowComments(drop.id)} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageCircle size={28} className="text-white" />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">0</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Share2 size={26} className="text-white" />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">Share</span>
                </button>

                {/* Mute/Unmute for videos */}
                {drop.media_type === 'video' && (
                  <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {isMuted ? (
                        <VolumeX size={20} className="text-white" />
                      ) : (
                        <Volume2 size={20} className="text-white" />
                      )}
                    </div>
                  </button>
                )}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-6 left-4 right-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold">
                    @{profile?.display_name || 'user'}
                  </span>
                </div>
                {drop.description && (
                  <p className="text-white/90 text-sm line-clamp-2">{drop.description}</p>
                )}
              </div>

              {/* Progress indicator */}
              <div className="absolute top-16 left-0 right-0 flex gap-1 px-4">
                {drops.map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i === index ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={20} className="text-black" />
      </button>

      {/* Create Dialog */}
      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={fetchDrops}
        type="drop"
      />

      {/* Comments Sheet */}
      {showComments && (
        <DropComments
          dropId={showComments}
          onClose={() => setShowComments(null)}
        />
      )}
    </div>
  );
};

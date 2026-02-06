import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Plus, Play, Eye, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from '@/components/CreatePostDialog';

interface Drop {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: string | null;
  duration: number | null;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export const Drops: React.FC = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchDrops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrops(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrops();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('drops_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, () => {
        fetchDrops();
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
            <Sparkles className="text-familiar-500" size={28} />
            Drops
          </h1>
          <p className="text-muted-foreground mt-1">Short videos & moments</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-familiar-500 hover:bg-familiar-600 rounded-full"
          size="sm"
        >
          <Plus size={18} className="mr-1" />
          Create Drop
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-familiar-500" size={32} />
        </div>
      ) : drops.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <Play size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Drops Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Share your first drop with the community! Short videos or images of your pet moments.
          </p>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-familiar-500 hover:bg-familiar-600"
          >
            <Plus size={18} className="mr-2" />
            Create Drop
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {drops.map((drop) => (
            <div 
              key={drop.id} 
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted group cursor-pointer"
            >
              {/* Media */}
              {drop.media_type === 'video' ? (
                <video 
                  src={drop.media_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <img 
                  src={drop.media_url}
                  alt={drop.title || 'Drop'}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Play Icon Overlay for videos */}
              {drop.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={20} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Drop Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {drop.title && (
                  <p className="text-white font-medium text-sm truncate mb-1">{drop.title}</p>
                )}
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {drop.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {drop.likes_count}
                  </span>
                </div>
              </div>

              {/* Duration Badge for videos */}
              {drop.media_type === 'video' && drop.duration && (
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
                  {Math.floor(drop.duration / 60)}:{(drop.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={fetchDrops}
        type="drop"
      />
    </div>
  );
};

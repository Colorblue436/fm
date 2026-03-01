import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Plus, Play, X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
      // Fetch profiles and likes for each drop
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

          return { ...drop, profile, user_liked };
        })
      );
      setDrops(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrops();
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

    if (drop.user_liked) {
      await supabase.from('drop_likes').delete().eq('drop_id', drop.id).eq('user_id', user.id);
      await supabase.from('drops').update({ likes_count: Math.max(0, (drop.likes_count || 0) - 1) }).eq('id', drop.id);
    } else {
      await supabase.from('drop_likes').insert({ drop_id: drop.id, user_id: user.id });
      await supabase.from('drops').update({ likes_count: (drop.likes_count || 0) + 1 }).eq('id', drop.id);
    }

    setDrops(prev =>
      prev.map(d =>
        d.id === drop.id
          ? { ...d, user_liked: !d.user_liked, likes_count: d.user_liked ? Math.max(0, (d.likes_count || 0) - 1) : (d.likes_count || 0) + 1 }
          : d
      )
    );
  };

  const handleShare = async (drop: DropItem) => {
    if (navigator.share) {
      await navigator.share({ title: drop.title || 'Check this out!', url: drop.media_url });
    } else {
      await navigator.clipboard.writeText(drop.media_url);
      addToast('Link copied!', 'success');
    }
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
              className="h-full snap-start snap-always relative flex items-center justify-center bg-black/5 rounded-2xl mb-2 overflow-hidden"
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

              {/* Right actions */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
                <button onClick={() => handleLike(drop)} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${drop.user_liked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'}`}>
                    <Heart size={20} className={drop.user_liked ? 'text-white fill-white' : 'text-white'} />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">{drop.likes_count || 0}</span>
                </button>

                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="text-white text-xs mt-1 font-medium">0</span>
                </button>

                <button onClick={() => handleShare(drop)} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={20} className="text-white" />
                  </div>
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-6 left-4 right-16">
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
    </div>
  );
};

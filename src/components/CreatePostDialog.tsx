import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/context/ToastContext';
import { Image, Video, X, Upload, Loader2 } from 'lucide-react';

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'community' | 'drop';
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onClose,
  onSuccess,
  type
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      addToast('Please select an image or video file', 'error');
      return;
    }

    // For drops, prefer video
    if (type === 'drop' && !isVideo && !isImage) {
      addToast('Drops support images and videos', 'error');
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast('Please sign in to post', 'error');
      return;
    }

    if (type === 'drop' && !mediaFile) {
      addToast('Drops require a video or image', 'error');
      return;
    }

    if (type === 'community' && !content.trim() && !mediaFile) {
      addToast('Please add some content or media', 'error');
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = null;

      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${type}/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
      }

      if (type === 'community') {
        const { error } = await supabase.from('community_posts').insert({
          user_id: user.id,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('drops').insert({
          user_id: user.id,
          title: title.trim() || null,
          description: description.trim() || null,
          media_url: mediaUrl!,
          media_type: mediaType
        });
        if (error) throw error;
      }

      addToast(type === 'community' ? 'Post shared!' : 'Drop created!', 'success');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Post error:', error);
      addToast(error.message || 'Failed to create post', 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setDescription('');
    clearMedia();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'community' ? 'Create Post' : 'Create Drop'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'drop' && (
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          )}

          <Textarea
            placeholder={type === 'community' ? "What's on your mind?" : "Description (optional)"}
            value={type === 'community' ? content : description}
            onChange={(e) => type === 'community' ? setContent(e.target.value) : setDescription(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={16} />
              </button>
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls className="w-full max-h-64 object-contain" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
              )}
            </div>
          )}

          {/* Media Upload Buttons */}
          {!mediaPreview && (
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Image size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Image</span>
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Video size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Video</span>
                </div>
              </label>
            </div>
          )}

          {type === 'drop' && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Drops are short videos or images that appear in the Drops feed. 
                Recommended video length: 15-60 seconds.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || (type === 'drop' && !mediaFile)}
              className="flex-1 bg-familiar-500 hover:bg-familiar-600"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  {type === 'community' ? 'Post' : 'Drop'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

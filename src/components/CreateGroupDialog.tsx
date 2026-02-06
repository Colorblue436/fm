import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/context/ToastContext';
import { Image, X, Loader2, Users, Globe, Lock } from 'lucide-react';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      addToast('Please enter a group name', 'error');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast('Please sign in to create a group', 'error');
      return;
    }

    setCreating(true);

    try {
      let coverImageUrl = null;

      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `groups/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-media')
          .upload(fileName, coverImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-media')
          .getPublicUrl(fileName);

        coverImageUrl = publicUrl;
      }

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          cover_image_url: coverImageUrl,
          owner_id: user.id,
          is_public: isPublic
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add owner as a member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      addToast('Group created successfully!', 'success');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create group error:', error);
      addToast(error.message || 'Failed to create group', 'error');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(true);
    clearCover();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} className="text-familiar-500" />
            Create Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cover Image */}
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden h-32">
              <button
                onClick={clearCover}
                className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={16} />
              </button>
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <div className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Image size={24} className="text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add cover image</span>
              </div>
            </label>
          )}

          <Input
            placeholder="Group name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
          />

          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px]"
          />

          {/* Privacy Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPublic(true)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                isPublic ? 'border-familiar-500 bg-familiar-50' : 'border-border'
              }`}
            >
              <Globe size={18} className={isPublic ? 'text-familiar-500' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${isPublic ? 'text-familiar-600' : 'text-muted-foreground'}`}>
                Public
              </span>
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                !isPublic ? 'border-familiar-500 bg-familiar-50' : 'border-border'
              }`}
            >
              <Lock size={18} className={!isPublic ? 'text-familiar-500' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${!isPublic ? 'text-familiar-600' : 'text-muted-foreground'}`}>
                Private
              </span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {isPublic 
              ? 'Anyone can find and join this group' 
              : 'Only invited members can join'}
          </p>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={creating || !name.trim()}
              className="flex-1 bg-familiar-500 hover:bg-familiar-600"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

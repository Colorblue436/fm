import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StorageCategory = 'photo' | 'video' | 'document' | 'health' | 'memory';

export interface StorageItem {
  id: string;
  user_id: string;
  pet_id: string | null;
  title: string;
  description: string | null;
  category: StorageCategory;
  file_url: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  bucket: string;
  ai_tags: string[] | null;
  ai_summary: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function detectCategory(file: File): StorageCategory {
  if (file.type.startsWith('image/')) return 'photo';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('word')) return 'document';
  return 'document';
}

export function useStorage(petId?: string | null) {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; progress: number } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('storage_items').select('*').order('created_at', { ascending: false });
    if (petId) q = q.eq('pet_id', petId);
    const { data, error } = await q;
    if (!error && data) setItems(data as StorageItem[]);
    setLoading(false);
  }, [petId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const uploadFile = useCallback(async (
    file: File,
    opts: { petId?: string | null; category?: StorageCategory; title?: string; description?: string } = {}
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const category = opts.category ?? detectCategory(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${opts.petId ?? 'general'}/${Date.now()}-${safeName}`;

    setUploadProgress({ name: file.name, progress: 30 });
    const { error: upErr } = await supabase.storage.from('pet-storage').upload(path, file, { upsert: false });
    if (upErr) { setUploadProgress(null); throw upErr; }

    setUploadProgress({ name: file.name, progress: 70 });
    const { data: { publicUrl } } = supabase.storage.from('pet-storage').getPublicUrl(path);

    const { error: dbErr } = await supabase.from('storage_items').insert({
      user_id: user.id,
      pet_id: opts.petId ?? null,
      title: opts.title ?? file.name,
      description: opts.description ?? null,
      category,
      file_url: publicUrl,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      bucket: 'pet-storage',
    });
    setUploadProgress(null);
    if (dbErr) throw dbErr;
    await fetchItems();
  }, [fetchItems]);

  const toggleFavorite = useCallback(async (item: StorageItem) => {
    await supabase.from('storage_items').update({ is_favorite: !item.is_favorite }).eq('id', item.id);
    await fetchItems();
  }, [fetchItems]);

  const deleteItem = useCallback(async (item: StorageItem) => {
    await supabase.storage.from(item.bucket).remove([item.file_path]);
    await supabase.from('storage_items').delete().eq('id', item.id);
    await fetchItems();
  }, [fetchItems]);

  const totalBytes = items.reduce((s, i) => s + (i.file_size ?? 0), 0);

  return { items, loading, uploadFile, uploadProgress, toggleFavorite, deleteItem, totalBytes, refresh: fetchItems };
}

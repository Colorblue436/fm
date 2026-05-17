
-- Storage items table
CREATE TABLE public.storage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'photo',
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  bucket TEXT NOT NULL DEFAULT 'pet-storage',
  ai_tags TEXT[],
  ai_summary TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_storage_items_user ON public.storage_items(user_id);
CREATE INDEX idx_storage_items_pet ON public.storage_items(pet_id);
CREATE INDEX idx_storage_items_category ON public.storage_items(category);

ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own storage items" ON public.storage_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own storage items" ON public.storage_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own storage items" ON public.storage_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own storage items" ON public.storage_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER storage_items_updated_at
  BEFORE UPDATE ON public.storage_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-storage', 'pet-storage', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Pet storage public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-storage');

CREATE POLICY "Users upload to own pet-storage folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-storage'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own pet-storage files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-storage'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own pet-storage files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-storage'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for pet media (avatars, memories)
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-media', 'pet-media', true);

-- Storage policies for pet-media bucket
CREATE POLICY "Users can view their own pet media"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own pet media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pet media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pet media"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create pet_memories table for storing memories (text, images, videos, audio)
CREATE TABLE public.pet_memories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('text', 'image', 'video', 'audio')),
    content TEXT, -- For text memories
    media_url TEXT, -- For media file URLs
    caption TEXT, -- Optional caption for media
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pet_memories
ALTER TABLE public.pet_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_memories - users can only access their own pets' memories
CREATE POLICY "Users can view their own pet memories"
ON public.pet_memories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet memories"
ON public.pet_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet memories"
ON public.pet_memories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet memories"
ON public.pet_memories FOR DELETE
USING (auth.uid() = user_id);
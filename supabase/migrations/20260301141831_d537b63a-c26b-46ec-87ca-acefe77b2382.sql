
-- Add UPDATE policy for vaccinations
CREATE POLICY "Users can update vaccinations for their pets"
ON public.vaccinations FOR UPDATE
USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid()));

-- Scratch Board table for emergency/important announcements
CREATE TABLE public.scratch_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'emergency')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scratch_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active scratch board posts"
ON public.scratch_board FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create scratch board posts"
ON public.scratch_board FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scratch board posts"
ON public.scratch_board FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scratch board posts"
ON public.scratch_board FOR DELETE
USING (auth.uid() = user_id);

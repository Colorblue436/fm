-- Create community posts table
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Community posts policies (public read, own user write)
CREATE POLICY "Anyone can view community posts"
ON public.community_posts
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own community posts"
ON public.community_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts"
ON public.community_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create drops table (short videos/media)
CREATE TABLE public.drops (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('video', 'image')) DEFAULT 'video',
    duration INTEGER, -- duration in seconds for videos
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for drops
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

-- Drops policies (public read, own user write)
CREATE POLICY "Anyone can view drops"
ON public.drops
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own drops"
ON public.drops
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drops"
ON public.drops
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drops"
ON public.drops
FOR DELETE
USING (auth.uid() = user_id);

-- Create groups table
CREATE TABLE public.groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    owner_id UUID NOT NULL,
    member_count INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Anyone can view public groups"
ON public.groups
FOR SELECT
USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their groups"
ON public.groups
FOR DELETE
USING (auth.uid() = owner_id);

-- Create group members table
CREATE TABLE public.group_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Enable RLS for group members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group members policies
CREATE POLICY "Anyone can view group members"
ON public.group_members
FOR SELECT
USING (true);

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);

-- Add user_mode to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_mode TEXT DEFAULT 'visitor' CHECK (user_mode IN ('visitor', 'pet_owner'));

-- Create storage policies for community media
CREATE POLICY "Anyone can view community media"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-media' AND (storage.foldername(name))[1] = 'community');

CREATE POLICY "Users can upload community media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-media' AND auth.uid() IS NOT NULL);

-- Enable realtime for community features
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
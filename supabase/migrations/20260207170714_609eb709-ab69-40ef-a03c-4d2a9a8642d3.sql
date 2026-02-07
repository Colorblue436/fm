-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('visitor', 'pet_parent');

-- Create user_roles table for proper role storage (separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's current role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY created_at DESC
    LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
ON public.user_roles FOR UPDATE
USING (auth.uid() = user_id);

-- Create drop_likes table for likes
CREATE TABLE public.drop_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID REFERENCES public.drops(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(drop_id, user_id)
);

ALTER TABLE public.drop_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view drop likes"
ON public.drop_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like drops"
ON public.drop_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike drops"
ON public.drop_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create drop_comments table
CREATE TABLE public.drop_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID REFERENCES public.drops(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.drop_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view drop comments"
ON public.drop_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.drop_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments"
ON public.drop_comments FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for drops feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.drop_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drop_comments;
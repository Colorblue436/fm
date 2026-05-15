
-- Enums
CREATE TYPE public.task_category AS ENUM ('feeding','walk','medicine','grooming','hydration','litter','play','training','other');
CREATE TYPE public.pet_mood AS ENUM ('happy','sleepy','hungry','playful','lonely','sick');
CREATE TYPE public.task_recurrence AS ENUM ('daily','weekly','custom');

-- pet_tasks
CREATE TABLE public.pet_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  category task_category NOT NULL,
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 10,
  recurrence task_recurrence NOT NULL DEFAULT 'daily',
  time_of_day text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tasks" ON public.pet_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tasks" ON public.pet_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tasks" ON public.pet_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tasks" ON public.pet_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER pet_tasks_updated BEFORE UPDATE ON public.pet_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pet_tasks_user ON public.pet_tasks(user_id);
CREATE INDEX idx_pet_tasks_pet ON public.pet_tasks(pet_id);

-- task_completions
CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own completions" ON public.task_completions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_task_completions_user_date ON public.task_completions(user_id, completed_at DESC);
CREATE INDEX idx_task_completions_task ON public.task_completions(task_id);

-- pet_stats
CREATE TABLE public.pet_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid NOT NULL UNIQUE,
  happiness integer NOT NULL DEFAULT 80,
  health_score integer NOT NULL DEFAULT 90,
  mood pet_mood NOT NULL DEFAULT 'happy',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pet_stats" ON public.pet_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pet_stats" ON public.pet_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pet_stats" ON public.pet_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pet_stats" ON public.pet_stats FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER pet_stats_updated BEFORE UPDATE ON public.pet_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own achievements" ON public.user_achievements FOR DELETE USING (auth.uid() = user_id);

-- auto-create pet_stats when a pet is created
CREATE OR REPLACE FUNCTION public.create_pet_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.pet_stats (user_id, pet_id) VALUES (NEW.user_id, NEW.id)
  ON CONFLICT (pet_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER pets_after_insert_stats AFTER INSERT ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.create_pet_stats();

-- backfill stats for existing pets
INSERT INTO public.pet_stats (user_id, pet_id)
SELECT user_id, id FROM public.pets
ON CONFLICT (pet_id) DO NOTHING;

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;

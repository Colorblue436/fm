
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  assistant_name text NOT NULL DEFAULT 'Familiar',
  voice_preference text NOT NULL DEFAULT 'system',
  language text NOT NULL DEFAULT 'en',
  response_length text NOT NULL DEFAULT 'detailed',
  response_style text NOT NULL DEFAULT 'paragraph',
  memory_enabled boolean NOT NULL DEFAULT true,
  default_pet_type text NOT NULL DEFAULT 'Dog',
  unit_system text NOT NULL DEFAULT 'metric',
  health_notifications boolean NOT NULL DEFAULT true,
  reminder_notifications boolean NOT NULL DEFAULT true,
  auto_location boolean NOT NULL DEFAULT true,
  default_location text DEFAULT NULL,
  open_in_maps boolean NOT NULL DEFAULT true,
  chat_notifications boolean NOT NULL DEFAULT true,
  vet_alerts boolean NOT NULL DEFAULT true,
  marketing_notifications boolean NOT NULL DEFAULT false,
  theme_mode text NOT NULL DEFAULT 'system',
  font_size integer NOT NULL DEFAULT 16,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  subscription_plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

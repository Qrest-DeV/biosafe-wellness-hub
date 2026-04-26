
-- Subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('none', 'essential', 'family');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  verified_patient BOOLEAN NOT NULL DEFAULT false,
  blood_type TEXT,
  age INTEGER,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  chronic_conditions TEXT[] NOT NULL DEFAULT '{}',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'none',
  subscription_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  refill_date DATE,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rx" ON public.prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own rx" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rx" ON public.prescriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rx" ON public.prescriptions FOR DELETE USING (auth.uid() = user_id);

-- Lab results
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  result_date DATE,
  file_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own labs" ON public.lab_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own labs" ON public.lab_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own labs" ON public.lab_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own labs" ON public.lab_results FOR DELETE USING (auth.uid() = user_id);

-- Consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT,
  specialty TEXT,
  consultation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own consults" ON public.consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consults" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own consults" ON public.consultations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own consults" ON public.consultations FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rx_updated BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_labs_updated BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_consults_updated BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for medical files (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false);

CREATE POLICY "Users view own medical files" ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own medical files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own medical files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own medical files" ON storage.objects FOR DELETE
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE OR REPLACE FUNCTION public.admin_list_profiles_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  username text,
  phone text,
  email text,
  blood_type text,
  age integer,
  weight_kg numeric,
  height_cm numeric,
  allergies text[],
  chronic_conditions text[],
  subscription_plan text,
  verified_patient boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT p.id, p.user_id, p.full_name, p.username, p.phone,
         u.email::text,
         p.blood_type, p.age, p.weight_kg, p.height_cm,
         p.allergies, p.chronic_conditions,
         p.subscription_plan::text, p.verified_patient, p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;
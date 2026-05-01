REVOKE EXECUTE ON FUNCTION public.admin_list_profiles_with_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles_with_email() TO authenticated;
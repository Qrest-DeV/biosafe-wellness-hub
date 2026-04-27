-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Replace broad public-bucket SELECT with admin-only listing; objects are still fetchable by direct URL because buckets are public.
DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
DROP POLICY IF EXISTS "Hero images public read" ON storage.objects;

CREATE POLICY "Admins list product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins list hero images" ON storage.objects
FOR SELECT USING (bucket_id = 'hero-images' AND public.has_role(auth.uid(), 'admin'));

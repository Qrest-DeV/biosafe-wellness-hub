
-- ENUMS
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending','paid','processing','shipped','delivered','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('unpaid','paid','refunded','failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE public.announcement_type AS ENUM ('info','warning','promo','success');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE public.discount_type AS ENUM ('percent','fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PRODUCT INVENTORY
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS sku text;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE TRIGGER trg_product_images_updated BEFORE UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text, full_name text, phone text,
  line1 text NOT NULL, line2 text,
  city text NOT NULL, state text, postal_code text,
  country text NOT NULL DEFAULT 'Nigeria',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all addresses" ON public.addresses FOR SELECT
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE next_val bigint;
BEGIN
  next_val := nextval('public.order_number_seq');
  RETURN 'BSW-' || to_char(now(),'YYYYMM') || '-' || lpad(next_val::text, 5, '0');
END; $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  payment_method text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  shipping numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  promo_code text,
  shipping_address jsonb,
  billing_address jsonb,
  tracking_number text,
  carrier text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE
  USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  price_snapshot numeric(12,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  type public.announcement_type NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements public read" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type public.discount_type NOT NULL DEFAULT 'percent',
  discount_value numeric(12,2) NOT NULL DEFAULT 0,
  min_order numeric(12,2) NOT NULL DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promo codes read active" ON public.promo_codes FOR SELECT USING (active = true);
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE TRIGGER trg_promo_codes_updated BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CUSTOMER NOTES
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_id uuid NOT NULL,
  note text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view customer notes" ON public.customer_notes FOR SELECT
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role) OR public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Staff manage customer notes" ON public.customer_notes FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role) OR public.has_role(auth.uid(),'doctor'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role) OR public.has_role(auth.uid(),'doctor'::app_role));
CREATE TRIGGER trg_customer_notes_updated BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_customer_notes_user ON public.customer_notes(user_id);

-- ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit log" ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.admin_audit_log(entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action text, _entity_type text, _entity_id text,
  _before jsonb DEFAULT NULL, _after jsonb DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid; user_email text;
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'staff'::app_role) OR public.has_role(auth.uid(),'doctor'::app_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT email::text INTO user_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, entity_type, entity_id, before, after)
  VALUES (auth.uid(), user_email, _action, _entity_type, _entity_id, _before, _after)
  RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

REVOKE EXECUTE ON FUNCTION public.log_admin_action(text,text,text,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text,text,text,jsonb,jsonb) TO authenticated;

-- STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.store_settings FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- DOCTOR/STAFF ACCESS to clinical
CREATE POLICY "Staff view all profiles" ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(),'doctor'::app_role) OR public.has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Doctors view all prescriptions" ON public.prescriptions FOR SELECT
  USING (public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Doctors manage prescriptions" ON public.prescriptions FOR ALL
  USING (public.has_role(auth.uid(),'doctor'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Doctors view all labs" ON public.lab_results FOR SELECT
  USING (public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Doctors manage labs" ON public.lab_results FOR ALL
  USING (public.has_role(auth.uid(),'doctor'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Doctors view all consultations" ON public.consultations FOR SELECT
  USING (public.has_role(auth.uid(),'doctor'::app_role));
CREATE POLICY "Doctors manage consultations" ON public.consultations FOR ALL
  USING (public.has_role(auth.uid(),'doctor'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'doctor'::app_role));


-- Update shops table: add new columns for platform rules
ALTER TABLE public.shops 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS payment_instructions text,
  ADD COLUMN IF NOT EXISTS plan_type text,
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_at timestamptz;

-- Create shop_orders table
CREATE TABLE public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  delivery_address text,
  city text,
  country text NOT NULL DEFAULT 'CIV',
  currency_label text NOT NULL DEFAULT 'FCFA',
  subtotal integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  order_ref text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- Admin sees all shop orders
CREATE POLICY "Admins can view all shop orders"
  ON public.shop_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Shop owner sees their shop orders
CREATE POLICY "Shop owners can view own shop orders"
  ON public.shop_orders FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()
  ));

-- Anyone can create shop orders (customers buying from a shop)
CREATE POLICY "Anyone can create shop orders"
  ON public.shop_orders FOR INSERT
  WITH CHECK (true);

-- Admin can update shop orders
CREATE POLICY "Admins can update shop orders"
  ON public.shop_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Shop owner can update their shop order status
CREATE POLICY "Shop owners can update own shop orders"
  ON public.shop_orders FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()
  ));

-- Create shop_order_items table
CREATE TABLE public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0
);

ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all shop order items"
  ON public.shop_order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Shop owners can view own shop order items"
  ON public.shop_order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shop_orders so
    JOIN public.shops s ON s.id = so.shop_id
    WHERE so.id = shop_order_items.order_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert shop order items"
  ON public.shop_order_items FOR INSERT
  WITH CHECK (true);

-- Create receipts table
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id),
  receipt_type text NOT NULL DEFAULT 'subscription',
  file_url text NOT NULL,
  plan_type text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  otp_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all receipts"
  ON public.receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update receipts"
  ON public.receipts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own receipts"
  ON public.receipts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON public.receipts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for receipt uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own receipts files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all receipt files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));

-- Update shops RLS: Admin can do everything
CREATE POLICY "Admins can update all shops"
  ON public.shops FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all shops"
  ON public.shops FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can manage subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.shop_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscriptions"
  ON public.shop_subscriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscriptions"
  ON public.shop_subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- =============================================
-- FIX: Convert all RESTRICTIVE policies to PERMISSIVE
-- This fixes guest checkout and all data access
-- =============================================

-- ===== ORDERS =====
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== ORDER_ITEMS =====
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== PAYMENT_RECEIPTS =====
DROP POLICY IF EXISTS "Anyone can insert payment receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "Admins can view all payment receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "Admins can update payment receipts" ON public.payment_receipts;

CREATE POLICY "Anyone can insert payment receipts" ON public.payment_receipts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all payment receipts" ON public.payment_receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment receipts" ON public.payment_receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== SHOP_ORDERS =====
DROP POLICY IF EXISTS "Anyone can create shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Shop owners can view own shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Admins can view all shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Admins can update shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Shop owners can update own shop orders" ON public.shop_orders;

CREATE POLICY "Anyone can create shop orders" ON public.shop_orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Shop owners can view own shop orders" ON public.shop_orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "Admins can view all shop orders" ON public.shop_orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update shop orders" ON public.shop_orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Shop owners can update own shop orders" ON public.shop_orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()));

-- ===== SHOP_ORDER_ITEMS =====
DROP POLICY IF EXISTS "Anyone can insert shop order items" ON public.shop_order_items;
DROP POLICY IF EXISTS "Shop owners can view own shop order items" ON public.shop_order_items;
DROP POLICY IF EXISTS "Admins can view all shop order items" ON public.shop_order_items;

CREATE POLICY "Anyone can insert shop order items" ON public.shop_order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Shop owners can view own shop order items" ON public.shop_order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM shop_orders so JOIN shops s ON s.id = so.shop_id
    WHERE so.id = shop_order_items.order_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all shop order items" ON public.shop_order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== PROFILES =====
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===== RECEIPTS =====
DROP POLICY IF EXISTS "Users can insert own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON public.receipts;
DROP POLICY IF EXISTS "Admins can update receipts" ON public.receipts;

CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all receipts" ON public.receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update receipts" ON public.receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== SHOPS =====
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can update all shops" ON public.shops;
DROP POLICY IF EXISTS "Users can create own shop" ON public.shops;
DROP POLICY IF EXISTS "Users can manage own shop" ON public.shops;

CREATE POLICY "Anyone can view active shops" ON public.shops
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can view all shops" ON public.shops
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all shops" ON public.shops
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own shop" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own shop" ON public.shops
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===== SHOP_SUBSCRIPTIONS =====
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.shop_subscriptions;

CREATE POLICY "Users can create own subscriptions" ON public.shop_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.shop_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.shop_subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert subscriptions" ON public.shop_subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscriptions" ON public.shop_subscriptions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== USER_ROLES =====
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow storage uploads for anon users (receipts bucket)
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
CREATE POLICY "Anyone can upload receipts" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Anyone can read receipts" ON storage.objects;
CREATE POLICY "Anyone can read receipts" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'receipts');


-- =============================================
-- FIX: Convert ALL RLS policies from RESTRICTIVE to PERMISSIVE
-- RESTRICTIVE means ALL policies must pass (AND logic)
-- PERMISSIVE means ANY policy can pass (OR logic)
-- We need OR logic: admin OR owner OR anon should work independently
-- =============================================

-- ============ inventory_items ============
DROP POLICY IF EXISTS "admin_all_inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "owner_select_inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "owner_insert_inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "owner_update_inventory_items" ON public.inventory_items;

CREATE POLICY "admin_all_inventory_items" ON public.inventory_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_inventory_items" ON public.inventory_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_inventory_items" ON public.inventory_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_update_inventory_items" ON public.inventory_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

-- ============ inventory_movements ============
DROP POLICY IF EXISTS "admin_all_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "owner_select_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "owner_insert_movements" ON public.inventory_movements;

CREATE POLICY "admin_all_movements" ON public.inventory_movements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_movements" ON public.inventory_movements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_movements.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_movements" ON public.inventory_movements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_movements.shop_id AND shops.user_id = auth.uid()));

-- ============ stock_replenishments ============
DROP POLICY IF EXISTS "admin_all_replenishments" ON public.stock_replenishments;
DROP POLICY IF EXISTS "owner_select_replenishments" ON public.stock_replenishments;
DROP POLICY IF EXISTS "owner_insert_replenishments" ON public.stock_replenishments;
DROP POLICY IF EXISTS "owner_update_replenishments" ON public.stock_replenishments;

CREATE POLICY "admin_all_replenishments" ON public.stock_replenishments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_replenishments" ON public.stock_replenishments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_replenishments" ON public.stock_replenishments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_update_replenishments" ON public.stock_replenishments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

-- ============ stock_replenishment_items ============
DROP POLICY IF EXISTS "admin_all_replenishment_items" ON public.stock_replenishment_items;
DROP POLICY IF EXISTS "owner_select_replenishment_items" ON public.stock_replenishment_items;
DROP POLICY IF EXISTS "owner_insert_replenishment_items" ON public.stock_replenishment_items;

CREATE POLICY "admin_all_replenishment_items" ON public.stock_replenishment_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_replenishment_items" ON public.stock_replenishment_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stock_replenishments sr JOIN public.shops s ON s.id = sr.shop_id WHERE sr.id = stock_replenishment_items.replenishment_id AND s.user_id = auth.uid()));

CREATE POLICY "owner_insert_replenishment_items" ON public.stock_replenishment_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stock_replenishments sr JOIN public.shops s ON s.id = sr.shop_id WHERE sr.id = stock_replenishment_items.replenishment_id AND s.user_id = auth.uid()));

-- ============ orders ============
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "auth_select_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_select_all_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;

CREATE POLICY "anon_insert_orders" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "auth_select_own_orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_select_all_orders" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ order_items ============
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;
DROP POLICY IF EXISTS "auth_select_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "admin_select_all_order_items" ON public.order_items;

CREATE POLICY "anon_insert_order_items" ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "auth_select_own_order_items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "admin_select_all_order_items" ON public.order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ payment_receipts ============
DROP POLICY IF EXISTS "anon_insert_payment_receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "admin_select_payment_receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "admin_update_payment_receipts" ON public.payment_receipts;

CREATE POLICY "anon_insert_payment_receipts" ON public.payment_receipts FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_select_payment_receipts" ON public.payment_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_payment_receipts" ON public.payment_receipts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ profiles ============
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;

CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_select_profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ============ receipts ============
DROP POLICY IF EXISTS "insert_own_receipts" ON public.receipts;
DROP POLICY IF EXISTS "select_own_receipts" ON public.receipts;
DROP POLICY IF EXISTS "admin_select_receipts" ON public.receipts;
DROP POLICY IF EXISTS "admin_update_receipts" ON public.receipts;

CREATE POLICY "insert_own_receipts" ON public.receipts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own_receipts" ON public.receipts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_select_receipts" ON public.receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_receipts" ON public.receipts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ shops ============
DROP POLICY IF EXISTS "anon_view_active_shops" ON public.shops;
DROP POLICY IF EXISTS "admin_view_all_shops" ON public.shops;
DROP POLICY IF EXISTS "owner_view_own_shop" ON public.shops;
DROP POLICY IF EXISTS "insert_own_shop" ON public.shops;
DROP POLICY IF EXISTS "update_own_shop" ON public.shops;
DROP POLICY IF EXISTS "admin_update_shops" ON public.shops;

CREATE POLICY "anon_view_active_shops" ON public.shops FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admin_view_all_shops" ON public.shops FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_view_own_shop" ON public.shops FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_shop" ON public.shops FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_shop" ON public.shops FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_update_shops" ON public.shops FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ shop_orders ============
DROP POLICY IF EXISTS "anon_insert_shop_orders" ON public.shop_orders;
DROP POLICY IF EXISTS "owner_select_shop_orders" ON public.shop_orders;
DROP POLICY IF EXISTS "admin_select_shop_orders" ON public.shop_orders;
DROP POLICY IF EXISTS "admin_update_shop_orders" ON public.shop_orders;
DROP POLICY IF EXISTS "owner_update_shop_orders" ON public.shop_orders;

CREATE POLICY "anon_insert_shop_orders" ON public.shop_orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "owner_select_shop_orders" ON public.shop_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "admin_select_shop_orders" ON public.shop_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_shop_orders" ON public.shop_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_update_shop_orders" ON public.shop_orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_orders.shop_id AND shops.user_id = auth.uid()));

-- ============ shop_order_items ============
DROP POLICY IF EXISTS "anon_insert_shop_order_items" ON public.shop_order_items;
DROP POLICY IF EXISTS "owner_select_shop_order_items" ON public.shop_order_items;
DROP POLICY IF EXISTS "admin_select_shop_order_items" ON public.shop_order_items;

CREATE POLICY "anon_insert_shop_order_items" ON public.shop_order_items FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "owner_select_shop_order_items" ON public.shop_order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shop_orders so JOIN public.shops s ON s.id = so.shop_id WHERE so.id = shop_order_items.order_id AND s.user_id = auth.uid()));

CREATE POLICY "admin_select_shop_order_items" ON public.shop_order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ shop_subscriptions ============
DROP POLICY IF EXISTS "insert_own_sub" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "select_own_sub" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "admin_select_subs" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "admin_insert_subs" ON public.shop_subscriptions;
DROP POLICY IF EXISTS "admin_update_subs" ON public.shop_subscriptions;

CREATE POLICY "insert_own_sub" ON public.shop_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own_sub" ON public.shop_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_select_subs" ON public.shop_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_subs" ON public.shop_subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_subs" ON public.shop_subscriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ user_roles ============
DROP POLICY IF EXISTS "admin_select_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_insert_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_delete_roles" ON public.user_roles;

CREATE POLICY "admin_select_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to check their own role (needed for has_role function to work via client)
CREATE POLICY "select_own_role" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

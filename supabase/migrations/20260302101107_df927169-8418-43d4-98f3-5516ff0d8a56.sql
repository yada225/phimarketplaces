
-- ========================================
-- INVENTORY MODULE: Tables & RLS
-- ========================================

-- Movement type enum
CREATE TYPE public.inventory_movement_type AS ENUM (
  'INITIAL', 'RESTOCK', 'SALE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN'
);

-- Replenishment status enum
CREATE TYPE public.replenishment_status AS ENUM ('DRAFT', 'RECEIVED', 'CANCELLED');

-- ========================================
-- inventory_items: tracks which products each shop stocks
-- ========================================
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  product_key text NOT NULL,
  sku text,
  reorder_level integer NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id, product_key)
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_inventory_items" ON public.inventory_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_inventory_items" ON public.inventory_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_inventory_items" ON public.inventory_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_update_inventory_items" ON public.inventory_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_items.shop_id AND shops.user_id = auth.uid()));

-- ========================================
-- inventory_movements: every stock change is recorded
-- ========================================
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  product_key text NOT NULL,
  movement_type inventory_movement_type NOT NULL,
  quantity integer NOT NULL,
  reference text,
  unit_cost integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_movements" ON public.inventory_movements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_movements" ON public.inventory_movements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_movements.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_movements" ON public.inventory_movements
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = inventory_movements.shop_id AND shops.user_id = auth.uid()));

-- ========================================
-- stock_replenishments: bulk restocking
-- ========================================
CREATE TABLE public.stock_replenishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  supplier_name text,
  status replenishment_status NOT NULL DEFAULT 'DRAFT',
  total_cost integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_replenishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_replenishments" ON public.stock_replenishments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_replenishments" ON public.stock_replenishments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_insert_replenishments" ON public.stock_replenishments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "owner_update_replenishments" ON public.stock_replenishments
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = stock_replenishments.shop_id AND shops.user_id = auth.uid()));

-- ========================================
-- stock_replenishment_items
-- ========================================
CREATE TABLE public.stock_replenishment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replenishment_id uuid REFERENCES public.stock_replenishments(id) ON DELETE CASCADE NOT NULL,
  product_key text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit_cost integer NOT NULL DEFAULT 0
);

ALTER TABLE public.stock_replenishment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_replenishment_items" ON public.stock_replenishment_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owner_select_replenishment_items" ON public.stock_replenishment_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stock_replenishments sr
    JOIN public.shops s ON s.id = sr.shop_id
    WHERE sr.id = stock_replenishment_items.replenishment_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "owner_insert_replenishment_items" ON public.stock_replenishment_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stock_replenishments sr
    JOIN public.shops s ON s.id = sr.shop_id
    WHERE sr.id = stock_replenishment_items.replenishment_id AND s.user_id = auth.uid()
  ));

-- ========================================
-- Function: get current stock level
-- ========================================
CREATE OR REPLACE FUNCTION public.get_stock_level(p_shop_id uuid, p_product_key text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(quantity), 0)::integer
  FROM public.inventory_movements
  WHERE shop_id = p_shop_id AND product_key = p_product_key
$$;

-- ========================================
-- Function: get all stock levels for a shop
-- ========================================
CREATE OR REPLACE FUNCTION public.get_shop_stock(p_shop_id uuid)
RETURNS TABLE(product_key text, current_stock bigint, reorder_level integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ii.product_key,
    COALESCE(SUM(im.quantity), 0) AS current_stock,
    ii.reorder_level
  FROM public.inventory_items ii
  LEFT JOIN public.inventory_movements im 
    ON im.shop_id = ii.shop_id AND im.product_key = ii.product_key
  WHERE ii.shop_id = p_shop_id AND ii.is_active = true
  GROUP BY ii.product_key, ii.reorder_level
$$;

-- ========================================
-- Function: receive replenishment (generates RESTOCK movements)
-- ========================================
CREATE OR REPLACE FUNCTION public.receive_replenishment(p_replenishment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_replenishment record;
  v_item record;
BEGIN
  SELECT * INTO v_replenishment FROM public.stock_replenishments WHERE id = p_replenishment_id;
  IF v_replenishment IS NULL THEN RAISE EXCEPTION 'Replenishment not found'; END IF;
  IF v_replenishment.status != 'DRAFT' THEN RAISE EXCEPTION 'Replenishment already processed'; END IF;

  FOR v_item IN SELECT * FROM public.stock_replenishment_items WHERE replenishment_id = p_replenishment_id
  LOOP
    INSERT INTO public.inventory_movements (shop_id, product_key, movement_type, quantity, reference, unit_cost, created_by)
    VALUES (v_replenishment.shop_id, v_item.product_key, 'RESTOCK', v_item.quantity, 'replenishment:' || p_replenishment_id, v_item.unit_cost, v_replenishment.created_by);

    -- Ensure inventory_items row exists
    INSERT INTO public.inventory_items (shop_id, product_key)
    VALUES (v_replenishment.shop_id, v_item.product_key)
    ON CONFLICT (shop_id, product_key) DO NOTHING;
  END LOOP;

  UPDATE public.stock_replenishments SET status = 'RECEIVED' WHERE id = p_replenishment_id;
END;
$$;

-- ========================================
-- Function: record sale movements from an order
-- ========================================
CREATE OR REPLACE FUNCTION public.record_sale_movements(p_order_id uuid, p_shop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
  v_current_stock integer;
BEGIN
  FOR v_item IN SELECT item_key, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    v_current_stock := public.get_stock_level(p_shop_id, v_item.item_key);
    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %: have %, need %', v_item.item_key, v_current_stock, v_item.quantity;
    END IF;

    INSERT INTO public.inventory_movements (shop_id, product_key, movement_type, quantity, reference)
    VALUES (p_shop_id, v_item.item_key, 'SALE', -v_item.quantity, 'order:' || p_order_id);
  END LOOP;
END;
$$;

-- ========================================
-- Soft delete for orders
-- ========================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

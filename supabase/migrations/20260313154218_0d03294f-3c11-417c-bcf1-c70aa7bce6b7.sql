
-- Fix 1: Prevent user_id spoofing in create_order_with_items
CREATE OR REPLACE FUNCTION public.create_order_with_items(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid;
  v_order_ref text;
  v_item jsonb;
  v_user_id uuid;
BEGIN
  -- Use auth.uid() instead of trusting payload user_id
  v_user_id := auth.uid();

  v_order_ref := 'PHI-' || upper(to_hex(extract(epoch from now())::bigint)) || upper(substring(gen_random_uuid()::text from 1 for 4));

  INSERT INTO public.orders (
    order_ref, user_id, customer_name, customer_email, customer_phone,
    delivery_address, city, country, currency_label, subtotal, total, status
  ) VALUES (
    v_order_ref,
    v_user_id,
    payload->>'customer_name',
    payload->>'customer_email',
    payload->>'customer_phone',
    payload->>'delivery_address',
    payload->>'city',
    COALESCE(payload->>'country', 'CIV'),
    COALESCE(payload->>'currency_label', 'FCFA'),
    COALESCE((payload->>'subtotal')::int, 0),
    COALESCE((payload->>'total')::int, 0),
    'pending_payment'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
  LOOP
    INSERT INTO public.order_items (order_id, item_type, item_key, item_name, quantity, unit_price, total_price)
    VALUES (
      v_order_id,
      COALESCE(v_item->>'item_type', 'product'),
      v_item->>'item_key',
      v_item->>'item_name',
      COALESCE((v_item->>'quantity')::int, 1),
      COALESCE((v_item->>'unit_price')::int, 0),
      COALESCE((v_item->>'total_price')::int, 0)
    );
  END LOOP;

  RETURN jsonb_build_object('order_id', v_order_id, 'order_ref', v_order_ref);
END;
$function$;

-- Fix 2: Remove self-grant subscription policy
DROP POLICY IF EXISTS "insert_own_sub" ON public.shop_subscriptions;

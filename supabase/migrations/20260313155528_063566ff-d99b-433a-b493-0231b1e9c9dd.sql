
-- Allow admins to DELETE orders
CREATE POLICY "admin_delete_orders" ON public.orders
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to DELETE order_items
CREATE POLICY "admin_delete_order_items" ON public.order_items
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to DELETE payment_receipts
CREATE POLICY "admin_delete_payment_receipts" ON public.payment_receipts
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

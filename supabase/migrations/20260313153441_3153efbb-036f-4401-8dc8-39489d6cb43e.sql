
-- Make receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- Drop all existing storage policies on objects for receipts bucket
DROP POLICY IF EXISTS "Allow public read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read receipts" ON storage.objects;
DROP POLICY IF EXISTS "receipts_public_read" ON storage.objects;
DROP POLICY IF EXISTS "receipts_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "receipts_anon_read" ON storage.objects;
DROP POLICY IF EXISTS "receipts_anon_upload" ON storage.objects;
DROP POLICY IF EXISTS "receipts_insert" ON storage.objects;
DROP POLICY IF EXISTS "receipts_select" ON storage.objects;

-- Authenticated users can upload to receipts bucket (scoped to their user id folder or orders folder)
CREATE POLICY "receipts_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
);

-- Authenticated users can read their own uploads + admins can read all
CREATE POLICY "receipts_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR (storage.foldername(name))[1] = 'orders'
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  auth.is_admin()
);

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.is_admin()
);

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  auth.is_admin()
);

-- Allow public read access to files
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'products');
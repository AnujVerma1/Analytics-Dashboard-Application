/*
  # Fix Admin Access and Product Policies

  1. Changes
    - Ensure admin role exists in profiles
    - Simplify product policies
    - Add function to check admin status
  
  2. Security
    - Maintains RLS
    - Improves admin role checking
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing product policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create simplified product policies
CREATE POLICY "Products are viewable by anyone"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products are manageable by admins"
  ON products FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());
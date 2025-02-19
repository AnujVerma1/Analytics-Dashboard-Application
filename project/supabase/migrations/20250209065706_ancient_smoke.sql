/*
  # Final Fix for Admin Access and Product Management

  1. Changes
    - Reset and recreate admin check function
    - Simplify product policies with explicit grants
    - Add trigger to ensure admin role preservation
  
  2. Security
    - Maintains RLS with improved clarity
    - Ensures admin privileges persist
*/

-- First, recreate the admin check function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop all existing product policies to start fresh
DROP POLICY IF EXISTS "Products are viewable by anyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can modify products" ON products;

-- Create explicit policies for each operation
CREATE POLICY "allow_select_products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

CREATE POLICY "allow_update_products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY "allow_delete_products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- Create a trigger to prevent admin role removal
CREATE OR REPLACE FUNCTION prevent_admin_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove admin role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_admin_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_removal();
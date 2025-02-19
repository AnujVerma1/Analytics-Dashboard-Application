/*
  # Fix Profile Policies to Prevent Infinite Recursion

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Add basic CRUD policies for profiles
    - Fix admin check in product and order policies
  
  2. Security
    - Maintains row-level security
    - Ensures users can only access their own data
    - Admins retain full access where needed
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can modify products" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new profile policies
CREATE POLICY "Profiles are viewable by owner"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Profiles are insertable by owner"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Fix products policy for admin access
CREATE POLICY "Admins can modify products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Fix orders policy
CREATE POLICY "Orders are viewable by owner or admin"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
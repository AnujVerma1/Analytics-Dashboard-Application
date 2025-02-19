/*
  # Update Analytics Tables and Functions
  
  This migration safely:
  1. Adds unique constraints if missing
  2. Updates functions and triggers
  3. Ensures RLS policies
  4. Initializes data without directly calling trigger functions
*/

-- Add unique constraints if they don't exist
DO $$ 
BEGIN 
  -- Add unique constraint to daily_stats.date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_stats_date_key'
  ) THEN
    ALTER TABLE daily_stats ADD CONSTRAINT daily_stats_date_key UNIQUE (date);
  END IF;

  -- Add unique constraint to customer_segments.segment_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customer_segments_segment_name_key'
  ) THEN
    ALTER TABLE customer_segments ADD CONSTRAINT customer_segments_segment_name_key UNIQUE (segment_name);
  END IF;
END $$;

-- Function to manually update daily stats (non-trigger version)
CREATE OR REPLACE FUNCTION manually_update_daily_stats(target_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    date,
    total_sales,
    total_orders,
    new_customers,
    page_views
  )
  SELECT
    target_date,
    COALESCE(SUM(o.total_amount), 0),
    COUNT(DISTINCT o.id),
    COUNT(DISTINCT p.id) FILTER (WHERE p.created_at::date = target_date),
    COUNT(ae.id) FILTER (WHERE ae.event_type = 'page_view')
  FROM (SELECT target_date) d
  LEFT JOIN orders o ON o.created_at::date = target_date
  LEFT JOIN profiles p ON p.created_at::date = target_date
  LEFT JOIN analytics_events ae ON ae.created_at::date = target_date
  ON CONFLICT (date) 
  DO UPDATE SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    new_customers = EXCLUDED.new_customers,
    page_views = EXCLUDED.page_views,
    created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for trigger
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM manually_update_daily_stats(CURRENT_DATE);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update customer segments
CREATE OR REPLACE FUNCTION update_customer_segments()
RETURNS void AS $$
BEGIN
  -- Clear existing segments
  DELETE FROM customer_segments;
  
  -- Insert new segments
  INSERT INTO customer_segments (segment_name, customer_count)
  SELECT
    CASE
      WHEN order_count = 0 THEN 'New'
      WHEN order_count BETWEEN 1 AND 3 THEN 'Regular'
      ELSE 'Loyal'
    END as segment_name,
    COUNT(*) as customer_count
  FROM (
    SELECT
      p.id,
      COUNT(o.id) as order_count
    FROM profiles p
    LEFT JOIN orders o ON o.customer_id = p.id
    GROUP BY p.id
  ) customer_stats
  GROUP BY
    CASE
      WHEN order_count = 0 THEN 'New'
      WHEN order_count BETWEEN 1 AND 3 THEN 'Regular'
      ELSE 'Loyal'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_stats_on_order ON orders;
DROP TRIGGER IF EXISTS update_stats_on_profile ON profiles;

-- Create triggers
CREATE TRIGGER update_stats_on_order
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_daily_stats();

CREATE TRIGGER update_stats_on_profile
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_daily_stats();

-- Ensure RLS policies exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Only admins can view analytics_events" ON analytics_events;
  DROP POLICY IF EXISTS "Only admins can view daily_stats" ON daily_stats;
  DROP POLICY IF EXISTS "Only admins can view customer_segments" ON customer_segments;

  -- Create new policies
  CREATE POLICY "Only admins can view analytics_events"
    ON analytics_events FOR SELECT
    TO authenticated
    USING (auth.is_admin());

  CREATE POLICY "Only admins can view daily_stats"
    ON daily_stats FOR SELECT
    TO authenticated
    USING (auth.is_admin());

  CREATE POLICY "Only admins can view customer_segments"
    ON customer_segments FOR SELECT
    TO authenticated
    USING (auth.is_admin());
END $$;

-- Initialize data
DO $$
BEGIN
  -- Initialize daily stats for current date if not exists
  PERFORM manually_update_daily_stats(CURRENT_DATE);
  
  -- Initialize customer segments
  PERFORM update_customer_segments();
END $$;
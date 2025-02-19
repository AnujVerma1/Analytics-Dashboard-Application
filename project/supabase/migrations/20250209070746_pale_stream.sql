/*
  # Add Analytics Tables

  1. New Tables
    - `analytics_events`
      - Tracks various events (page views, orders, etc.)
    - `daily_stats`
      - Aggregated daily statistics
    - `customer_segments`
      - Customer segmentation data

  2. Functions
    - `record_event` - Records analytics events
    - `aggregate_daily_stats` - Aggregates statistics daily
    - `update_customer_segments` - Updates customer segmentation

  3. Security
    - RLS policies for analytics tables
    - Only admins can view analytics data
*/

-- Analytics Events Table
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Daily Stats Table
CREATE TABLE daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_sales numeric(10,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  new_customers integer DEFAULT 0,
  page_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Customer Segments Table
CREATE TABLE customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name text NOT NULL,
  customer_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Function to record events
CREATE OR REPLACE FUNCTION record_analytics_event(
  event_type text,
  user_id uuid,
  metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_events (event_type, user_id, metadata)
  VALUES (event_type, user_id, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, total_sales, total_orders, new_customers, page_views)
  SELECT
    target_date,
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT p.id) FILTER (WHERE p.created_at::date = target_date) as new_customers,
    COUNT(ae.id) FILTER (WHERE ae.event_type = 'page_view') as page_views
  FROM generate_series(target_date, target_date, interval '1 day') as d
  LEFT JOIN orders o ON o.created_at::date = d
  LEFT JOIN profiles p ON p.created_at::date = d
  LEFT JOIN analytics_events ae ON ae.created_at::date = d
  GROUP BY d;
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
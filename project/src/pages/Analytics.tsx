import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DailyStat {
    date: string;
    total_sales: number;
    total_orders: number;
    new_customers: number;
    page_views: number;
  }
  interface CustomerSegment {
    segment_name: string;
    customer_count: number;
  }
  
);
};

export default Analytics;
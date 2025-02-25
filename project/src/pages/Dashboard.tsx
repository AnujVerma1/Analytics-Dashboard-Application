import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeCustomers: number;
  revenue: number;
}
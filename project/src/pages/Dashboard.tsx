import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeCustomers: number;
  revenue: number;
}

interface SalesData {
  name: string;
  sales: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    activeCustomers: 0,
    revenue: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchSalesData();

    // Set up real-time subscriptions
    const ordersChannel = supabase.channel('orders-changes');
    const profilesChannel = supabase.channel('profiles-changes');

    ordersChannel
    .on(
      'postgres_changes',
      {

        event: '*',
        schema: 'public',
        table: 'orders'
      },

      () => {
        fetchDashboardStats();
        fetchSalesData();
      }
    )
    .subscribe();

    profilesChannel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      () => {
        fetchDashboardStats();
      }
    )
    .subscribe();
     // Cleanup subscriptions
     return () => {
      ordersChannel.unsubscribe();
      profilesChannel.unsubscribe();
    };
  }, []);
  const fetchDashboardStats = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

      if (ordersError) throw ordersError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
      .from('profiles')
      .select('*');

      if (ordersError) throw ordersError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
      .from('profiles')
      .select('*');

      if (customersError) throw customersError;

      // Calculate stats
      updateStats(orders || [], customers || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const { data: dailyStats, error } = await supabase
      .from('daily_stats')
      .select('date, total_sales')
        .gte('date', sixMonthsAgo.toISOString())
        .lte('date', today.toISOString())
        .order('date');

        if (error) throw error;

      // Process the data for the chart
      const monthlyData = (dailyStats || []).reduce((acc, stat) => {
        const date = new Date(stat.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        if (!acc[monthYear]) {
          acc[monthYear] = 0;



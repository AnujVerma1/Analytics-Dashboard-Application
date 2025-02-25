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

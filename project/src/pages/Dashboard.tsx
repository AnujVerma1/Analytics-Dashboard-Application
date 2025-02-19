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
        }
        acc[monthYear] += Number(stat.total_sales);
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format for the chart
      const chartData = Object.entries(monthlyData).map(([name, sales]) => ({
        name,
        sales: Number(sales.toFixed(2))
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data');
    }
  };

  const updateStats = (orders: any[], customers: any[]) => {
    setStats({
      totalSales: orders.length,
      totalOrders: orders.length,
      activeCustomers: customers.length,
      revenue: orders.reduce((acc, order) => acc + Number(order.total_amount), 0),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sales</h3>
          <p className="text-2xl font-bold">{stats.totalSales}</p>
          <div className="mt-2 text-xs text-gray-500">Updates in real-time</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
          <div className="mt-2 text-xs text-gray-500">Updates in real-time</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Customers</h3>
          <p className="text-2xl font-bold">{stats.activeCustomers}</p>
          <div className="mt-2 text-xs text-gray-500">Updates in real-time</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Revenue</h3>
          <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
          <div className="mt-2 text-xs text-gray-500">Updates in real-time</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Monthly sales data - Updates in real-time
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
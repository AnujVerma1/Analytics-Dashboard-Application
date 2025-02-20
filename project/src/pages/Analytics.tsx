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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];


  const Analytics = () => {
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
        fetchAnalytics();
      }, []);

      const fetchAnalytics = async () => {
        try {
          // Fetch daily stats for the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: stats, error: statsError } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date');

        
      if (statsError) throw statsError;

        // Fetch customer segments
        const { data: segments, error: segmentsError } = await supabase
        .from('customer_segments')
        .select('*');

        if (segmentsError) throw segmentsError;

        
      setDailyStats(stats || []);
      setCustomerSegments(segments || []);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
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
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_sales" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Customer Distribution */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Customer Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="customer_count"
                nameKey="segment_name"
                label
              >
                {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Orders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Daily Orders</h2>
        <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dailyStats}>
};

export default Analytics;
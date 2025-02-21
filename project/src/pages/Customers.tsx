import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin } from 'lucide-react';


interface Customer {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
          </div>
 ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {customers.map((customer) => (
      <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      div className="flex items-center space-x-4 mb-4">
      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
      <span className="text-blue-600 dark:text-blue-300 text-lg font-semibold">
                    {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{customer.full_name || 'Unknown'}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Customer</p>
                </div>
              </div>

export default Customers;
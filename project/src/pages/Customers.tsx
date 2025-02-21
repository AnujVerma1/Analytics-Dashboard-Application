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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>

export default Customers;
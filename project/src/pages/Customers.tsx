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
export default Customers;
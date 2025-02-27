import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  stock: number;
}

const Inventory = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
      .rpc('get_low_stock_products', { threshold: 10 });


      if (error) throw error;
      if (data) setLowStockProducts(data);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
     } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
    <h1 className="text-2xl font-bold">Inventory Management</h1>
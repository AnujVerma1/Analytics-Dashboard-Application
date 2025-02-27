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

    {loading ? (
      <div className="flex justify-center">
        
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        ) : (
          <>
          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
            <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
key={product.id}
className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
>
<div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">
                      {product.name}
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Current Stock: {product.stock}
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                    Restock
                  </button>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  No products are currently low in stock.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Inventory;
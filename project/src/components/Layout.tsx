import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart2, BoxSelect as BoxSeam, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/inventory', icon: BoxSeam, label: 'Inventory' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

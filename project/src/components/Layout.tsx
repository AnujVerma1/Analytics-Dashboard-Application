import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart2, BoxSelect as BoxSeam, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
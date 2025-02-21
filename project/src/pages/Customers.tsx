import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin } from 'lucide-react';


interface Customer {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}



export default Customers;
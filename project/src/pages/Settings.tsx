import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

const Settings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

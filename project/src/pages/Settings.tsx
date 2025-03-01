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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

       // First try to get the existing profile
       let { data: existingProfile, error: fetchError } = await supabase
       .from('profiles')
       .select('id, email, full_name, avatar_url')
       .eq('id', user.id)
        .maybeSingle();

        
      if (fetchError) throw fetchError;

      if (!existingProfile) {
         // Profile doesn't exist, create it
         const { data: newProfile, error: insertError } = await supabase
         .from('profiles')
         .insert([
          {
            id: user.id,
            email: user.email,
            full_name: '',
            role: 'user'
          }
          
        ])
        .select('id, email, full_name, avatar_url')
        .maybeSingle();
        if (insertError) throw insertError;
        existingProfile = newProfile;
      }

      if (existingProfile) {
        setProfile(existingProfile);
        setFullName(existingProfile.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile' });
    } finally {
      setLoading(false);
    }
  };

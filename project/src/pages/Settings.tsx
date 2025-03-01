import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
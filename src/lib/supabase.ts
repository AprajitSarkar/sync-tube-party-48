
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyojnmvamgagftfefqie.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5b2pubXZhbWdhZ2Z0ZmVmcWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzc1MjksImV4cCI6MjA1Njk1MzUyOX0.URX4ffOz0KS1Rk2mX4NWHl05EyHX5PM2D9-p7NzByWE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we're using environment variables or fallbacks
export const isUsingEnvVars = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log('Supabase client initialized', { 
  usingEnvVars: isUsingEnvVars 
});

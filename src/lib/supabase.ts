
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tjjkwlvcwbyyqhnqfrzg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqamt3bHZjd2J5eXFobnFmcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODU5OTQsImV4cCI6MjA1Njc2MTk5NH0.XrTmvzDH4lW84SIZFJctOZWrkOpD7dv2RV2AnSmlPSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we're using environment variables or fallbacks
export const isUsingEnvVars = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log('Supabase client initialized', { 
  usingEnvVars: isUsingEnvVars 
});

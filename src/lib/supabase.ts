
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuxqhggfgsbdkeynbbub.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eHFoZ2dmZ3NiZGtleW5iYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MTQwNDgsImV4cCI6MjA1Njk5MDA0OH0.3CG3HFDXJXkx0EcnCQs6SO5wIQw8seKeNToe-b3h-Y0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we're using environment variables or fallbacks
export const isUsingEnvVars = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Default YouTube API key
export const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyB-qDaqVOnqVjiSIYfxJl2SZRySLjG9SR0';

console.log('Supabase client initialized', { 
  usingEnvVars: isUsingEnvVars 
});

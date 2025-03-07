
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnrpignbkicrlxravorf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnBpZ25ia2ljcmx4cmF2b3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjQ5MzMsImV4cCI6MjA1Njk0MDkzM30.BQBPZZdJ1pm_CnIC5qYOyOlal-VbJin23c8I5u4ajlE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we're using environment variables or fallbacks
export const isUsingEnvVars = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log('Supabase client initialized', { 
  usingEnvVars: isUsingEnvVars 
});


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjjkwlvcwbyyqhnqfrzg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqamt3bHZjd2J5eXFobnFmcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODU5OTQsImV4cCI6MjA1Njc2MTk5NH0.XrTmvzDH4lW84SIZFJctOZWrkOpD7dv2RV2AnSmlPSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

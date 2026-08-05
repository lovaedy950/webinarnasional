import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ejzupvxuknwdugoxdzue.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqenVwdnh1a253ZHVnb3hkenVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDY2MDAsImV4cCI6MjEwMTQ4MjYwMH0.-Sxx_RmUGF8poLlvQSXacQdkud6nqL5edOt8x51Kw7c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

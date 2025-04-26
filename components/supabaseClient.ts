import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fwvwxzvynfrqjvizcejf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dnd4enZ5bmZycWp2aXpjZWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjcwNjEsImV4cCI6MjA2MTE0MzA2MX0.Sy1QPMdReZm9Q-RndAZBYJa40BVzWp2KCeqssVoMlqs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY); 
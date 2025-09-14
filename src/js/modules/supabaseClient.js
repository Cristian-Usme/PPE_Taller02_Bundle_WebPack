import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssfzqmbfgsgnwfpnpcyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZnpxbWJmZ3NnbndmcG5wY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzY5OTYsImV4cCI6MjA3MzQ1Mjk5Nn0.nn89xvrZPvcZ6Gv3XztjhghadMUKnw2n4YJesq9C40c';
export const supabase = createClient(supabaseUrl, supabaseKey);
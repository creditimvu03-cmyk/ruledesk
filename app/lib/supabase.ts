import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyyteelkhfzycbopadxw.supabase.co'
const supabaseAnonKey = 'eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eXRlZWxraGZ6eWNib3BhZHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg2NjYsImV4cCI6MjA1NjgxNDY2Nn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eXRlZWxraGZ6eWNib3BhZHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg2NjYsImV4cCI6MjA1NjgxNDY2Nn0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
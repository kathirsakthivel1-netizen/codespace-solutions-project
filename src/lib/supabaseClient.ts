import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any = null

// Initialize Supabase only if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
  }
} else {
  console.warn('Supabase credentials not found in environment variables. Running in demo mode.')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ set' : '✗ missing')
}

export { supabase }
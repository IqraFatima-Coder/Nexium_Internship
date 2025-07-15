import { createClient as supabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Rename the exported function to avoid naming conflict
export const createClient = () => 
  supabaseClient(supabaseUrl, supabaseKey)

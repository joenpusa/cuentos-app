import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the Service Role Key.
 * WARNING: This client bypasses Row Level Security (RLS).
 * It should ONLY be used in secure Server Actions or API routes
 * after properly verifying the permissions of the calling user.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

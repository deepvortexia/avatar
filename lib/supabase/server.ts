import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client for API routes
// Uses service role key to bypass RLS
// Auth is verified via getUser(token) with the JWT from Authorization header
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase URL or API key not configured')
    }
    return null as any
  }

  return createSupabaseClient(url, serviceKey || anonKey!)
}

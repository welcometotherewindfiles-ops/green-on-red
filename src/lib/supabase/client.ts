// ============================================================
// Supabase Browser Client
// Use this in Client Components ('use client')
// ============================================================
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL — add your Supabase project URL to .env.local'
    )
  }
  if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY — add your Supabase anon key to .env.local'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

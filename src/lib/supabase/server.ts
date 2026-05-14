// ============================================================
// Supabase Server Client
// Use this in Server Components, Server Actions, Route Handlers
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local — see README.md for setup instructions.'
    )
  }
  if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local — see README.md for setup instructions.'
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

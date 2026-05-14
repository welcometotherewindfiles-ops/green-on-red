// ============================================================
// Auth Helpers — server-side user/role utilities
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { type Profile, type UserRole } from '@/types'

/**
 * Returns the current authenticated user's profile from the
 * profiles table, including their role. Returns null if not
 * authenticated or if no profile exists yet.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null

  return profile as Profile
}

/**
 * Returns just the role of the current user. Useful for
 * quick role checks in Server Components.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile()
  return profile?.role ?? null
}

/**
 * Returns true if the current user is the admin.
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentRole()
  return role === 'admin'
}

// ============================================================
// Green on Red — Server-side data fetching helpers
// All functions run server-side only (Server Components /
// Route Handlers). They use the server Supabase client which
// reads the session from cookies automatically.
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { type Meeting, type Category } from '@/types'

// ─── Meetings ────────────────────────────────────────────────

/**
 * Returns the single next upcoming meeting (meeting_date > now),
 * ordered by date ascending so the soonest one comes first.
 * Returns null if none exists.
 */
export async function getUpcomingMeeting(): Promise<Meeting | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .gt('meeting_date', now)
    .order('meeting_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getUpcomingMeeting error:', error.message)
    return null
  }
  return data as Meeting | null
}

/**
 * Returns the single most recently completed meeting
 * (meeting_date <= now), ordered descending so the latest
 * past meeting comes first.
 * Returns null if none exists.
 */
export async function getMostRecentPastMeeting(): Promise<Meeting | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .lte('meeting_date', now)
    .order('meeting_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getMostRecentPastMeeting error:', error.message)
    return null
  }
  return data as Meeting | null
}

/**
 * Returns ALL meetings ordered: upcoming first (asc),
 * then past (desc). Used by the Meetings section index.
 */
export async function getAllMeetings(): Promise<Meeting[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Two queries, union in JS — Supabase doesn't support UNION directly
  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from('meetings')
      .select('*')
      .gt('meeting_date', now)
      .order('meeting_date', { ascending: true }),
    supabase
      .from('meetings')
      .select('*')
      .lte('meeting_date', now)
      .order('meeting_date', { ascending: false }),
  ])

  const upcoming = (upcomingRes.data ?? []) as Meeting[]
  const past = (pastRes.data ?? []) as Meeting[]
  return [...upcoming, ...past]
}

/**
 * Returns a single meeting by ID. Returns null if not found.
 */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getMeetingById error:', error.message)
    return null
  }
  return data as Meeting | null
}

// ─── Categories ──────────────────────────────────────────────

/**
 * Returns all categories ordered by sort_order.
 */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getAllCategories error:', error.message)
    return []
  }
  return (data ?? []) as Category[]
}

/**
 * Returns a single category by slug. Returns null if not found.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('getCategoryBySlug error:', error.message)
    return null
  }
  return data as Category | null
}

// ============================================================
// Green on Red — Server-side data fetching helpers
// All functions run server-side only (Server Components /
// Route Handlers). They use the server Supabase client which
// reads the session from cookies automatically.
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { type Meeting, type Category, type ContentItem } from '@/types'

// ─── Meetings ────────────────────────────────────────────────

/**
 * Returns the single next upcoming meeting (meeting_date > now),
 * ordered ascending so the soonest comes first.
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

  if (error) { console.error('getUpcomingMeeting:', error.message); return null }
  return data as Meeting | null
}

/**
 * Returns the most recently completed meeting (meeting_date <= now).
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

  if (error) { console.error('getMostRecentPastMeeting:', error.message); return null }
  return data as Meeting | null
}

/**
 * Returns ALL meetings: upcoming first (asc), then past (desc).
 */
export async function getAllMeetings(): Promise<Meeting[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [upcomingRes, pastRes] = await Promise.all([
    supabase.from('meetings').select('*').gt('meeting_date', now).order('meeting_date', { ascending: true }),
    supabase.from('meetings').select('*').lte('meeting_date', now).order('meeting_date', { ascending: false }),
  ])

  const upcoming = (upcomingRes.data ?? []) as Meeting[]
  const past     = (pastRes.data ?? []) as Meeting[]
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

  if (error) { console.error('getMeetingById:', error.message); return null }
  return data as Meeting | null
}

/**
 * Returns a meeting plus its associated pre-study content items,
 * joined through the content_meetings junction table.
 */
export async function getMeetingWithContent(id: string): Promise<{
  meeting: Meeting
  preMaterials: ContentItem[]
} | null> {
  const supabase = await createClient()

  // Fetch meeting and its linked content items in parallel
  const [meetingRes, contentRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('content_items')
      .select('*, content_meetings!inner(meeting_id)')
      .eq('content_meetings.meeting_id', id)
      .order('published_at', { ascending: true }),
  ])

  if (meetingRes.error || !meetingRes.data) {
    console.error('getMeetingWithContent meeting:', meetingRes.error?.message)
    return null
  }

  return {
    meeting: meetingRes.data as Meeting,
    preMaterials: (contentRes.data ?? []) as ContentItem[],
  }
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

  if (error) { console.error('getAllCategories:', error.message); return [] }
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

  if (error) { console.error('getCategoryBySlug:', error.message); return null }
  return data as Category | null
}

// ─── Content Items ────────────────────────────────────────────

/**
 * Returns all content items for a given category slug,
 * newest first.
 */
export async function getContentByCategory(categorySlug: string): Promise<ContentItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .select(`
      *,
      content_categories!inner(
        category_id,
        categories!inner(slug)
      )
    `)
    .eq('content_categories.categories.slug', categorySlug)
    .order('published_at', { ascending: false })

  if (error) { console.error('getContentByCategory:', error.message); return [] }
  return (data ?? []) as ContentItem[]
}

/**
 * Returns a single content item by ID.
 */
export async function getContentItemById(id: string): Promise<ContentItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) { console.error('getContentItemById:', error.message); return null }
  return data as ContentItem | null
}

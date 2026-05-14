// ============================================================
// Green on Red — Server-side data fetching helpers
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { type Meeting, type Category, type ContentItem } from '@/types'

// ─── Meetings ────────────────────────────────────────────────

export async function getUpcomingMeeting(): Promise<Meeting | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('meetings').select('*')
    .gt('meeting_date', now)
    .order('meeting_date', { ascending: true })
    .limit(1).maybeSingle()
  if (error) { console.error('getUpcomingMeeting:', error.message); return null }
  return data as Meeting | null
}

export async function getMostRecentPastMeeting(): Promise<Meeting | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('meetings').select('*')
    .lte('meeting_date', now)
    .order('meeting_date', { ascending: false })
    .limit(1).maybeSingle()
  if (error) { console.error('getMostRecentPastMeeting:', error.message); return null }
  return data as Meeting | null
}

export async function getAllMeetings(): Promise<Meeting[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const [upcomingRes, pastRes] = await Promise.all([
    supabase.from('meetings').select('*').gt('meeting_date', now).order('meeting_date', { ascending: true }),
    supabase.from('meetings').select('*').lte('meeting_date', now).order('meeting_date', { ascending: false }),
  ])
  return [...((upcomingRes.data ?? []) as Meeting[]), ...((pastRes.data ?? []) as Meeting[])]
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings').select('*').eq('id', id).maybeSingle()
  if (error) { console.error('getMeetingById:', error.message); return null }
  return data as Meeting | null
}

export async function getMeetingWithContent(id: string): Promise<{
  meeting: Meeting
  preMaterials: ContentItem[]
} | null> {
  const supabase = await createClient()
  const [meetingRes, contentRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('content_items')
      .select('*, content_meetings!inner(meeting_id)')
      .eq('content_meetings.meeting_id', id)
      .order('published_at', { ascending: true }),
  ])
  if (meetingRes.error || !meetingRes.data) {
    console.error('getMeetingWithContent:', meetingRes.error?.message)
    return null
  }
  return {
    meeting: meetingRes.data as Meeting,
    preMaterials: (contentRes.data ?? []) as ContentItem[],
  }
}

// ─── Categories ──────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories').select('*').order('sort_order', { ascending: true })
  if (error) { console.error('getAllCategories:', error.message); return [] }
  return (data ?? []) as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories').select('*').eq('slug', slug).maybeSingle()
  if (error) { console.error('getCategoryBySlug:', error.message); return null }
  return data as Category | null
}

// ─── Content Items ────────────────────────────────────────────

/**
 * All content items for a category, newest first.
 * Uses a two-step approach: get IDs from junction, then fetch items.
 * This avoids Supabase nested filter limitations.
 */
export async function getContentByCategory(categorySlug: string): Promise<ContentItem[]> {
  const supabase = await createClient()

  // Step 1: get the category id
  const { data: cat, error: catErr } = await supabase
    .from('categories').select('id').eq('slug', categorySlug).maybeSingle()
  if (catErr || !cat) { console.error('getContentByCategory cat:', catErr?.message); return [] }

  // Step 2: get content_item_ids linked to this category
  const { data: junctions, error: jErr } = await supabase
    .from('content_categories')
    .select('content_item_id')
    .eq('category_id', cat.id)
  if (jErr) { console.error('getContentByCategory junction:', jErr.message); return [] }

  const ids = (junctions ?? []).map((j: { content_item_id: string }) => j.content_item_id)
  if (ids.length === 0) return []

  // Step 3: fetch the actual items
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .in('id', ids)
    .order('published_at', { ascending: false })
  if (error) { console.error('getContentByCategory items:', error.message); return [] }
  return (data ?? []) as ContentItem[]
}

/**
 * Single content item with its category and meeting relations.
 */
export async function getContentItemWithRelations(id: string): Promise<{
  item: ContentItem
  categories: Category[]
  meetings: Meeting[]
} | null> {
  const supabase = await createClient()

  const [itemRes, catRes, meetRes] = await Promise.all([
    supabase.from('content_items').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('content_categories')
      .select('category_id, categories(*)')
      .eq('content_item_id', id),
    supabase
      .from('content_meetings')
      .select('meeting_id, meetings(*)')
      .eq('content_item_id', id),
  ])

  if (itemRes.error || !itemRes.data) {
    console.error('getContentItemWithRelations:', itemRes.error?.message)
    return null
  }

  const categories = (catRes.data ?? [])
    .map((r: { categories: unknown }) => r.categories)
    .filter(Boolean) as Category[]

  const meetings = (meetRes.data ?? [])
    .map((r: { meetings: unknown }) => r.meetings)
    .filter(Boolean) as Meeting[]

  return { item: itemRes.data as ContentItem, categories, meetings }
}

export async function getContentItemById(id: string): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items').select('*').eq('id', id).maybeSingle()
  if (error) { console.error('getContentItemById:', error.message); return null }
  return data as ContentItem | null
}

/**
 * All meetings as {id, title, meeting_date} — for the meeting
 * association dropdown in the content form.
 */
export async function getAllMeetingsSimple(): Promise<Pick<Meeting, 'id' | 'title' | 'meeting_date'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, meeting_date')
    .order('meeting_date', { ascending: false })
  if (error) { console.error('getAllMeetingsSimple:', error.message); return [] }
  return (data ?? []) as Pick<Meeting, 'id' | 'title' | 'meeting_date'>[]
}

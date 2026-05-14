'use server'
// ============================================================
// Server Actions — Content Items
// All mutations check isAdmin() before touching the DB.
// Handles the content_categories and content_meetings junction
// tables so the caller never has to think about them.
// ============================================================
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { type ContentType } from '@/types'

// ─── Types ───────────────────────────────────────────────────

export interface ContentFormData {
  title: string
  content_type: ContentType
  description: string
  // Post
  body: string
  // Link
  url: string
  // File
  file_url: string
  file_name: string
  // Relations
  category_ids: string[]   // UUIDs of selected categories
  meeting_ids: string[]    // UUIDs of associated meetings
  published_at: string     // ISO date string
}

// ─── Helpers ─────────────────────────────────────────────────

/** Sync junction table rows: delete old, insert new. */
async function syncJunction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'content_categories' | 'content_meetings',
  itemColumn: 'content_item_id',
  relColumn: 'category_id' | 'meeting_id',
  contentItemId: string,
  newIds: string[],
) {
  // Delete existing
  await supabase.from(table).delete().eq(itemColumn, contentItemId)

  if (newIds.length === 0) return

  // Insert new
  const rows = newIds.map(id => ({
    [itemColumn]: contentItemId,
    [relColumn]: id,
  }))
  const { error } = await supabase.from(table).insert(rows)
  if (error) throw new Error(`${table} sync failed: ${error.message}`)
}

function revalidateAll(categoryIds?: string[]) {
  revalidatePath('/library', 'layout')
  revalidatePath('/')
  // Revalidate specific category pages if we know them
  if (categoryIds && categoryIds.length > 0) {
    revalidatePath('/library/[category]', 'page')
  }
}

// ─── Create ──────────────────────────────────────────────────

export async function createContent(formData: ContentFormData): Promise<{ id: string }> {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      title:        formData.title.trim(),
      content_type: formData.content_type,
      description:  formData.description.trim() || null,
      body:         formData.content_type === 'post' ? (formData.body || null) : null,
      url:          formData.content_type === 'link' ? (formData.url.trim() || null) : null,
      file_url:     formData.content_type === 'file' ? (formData.file_url.trim() || null) : null,
      file_name:    formData.content_type === 'file' ? (formData.file_name.trim() || null) : null,
      published_at: formData.published_at || new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Sync junction tables
  await Promise.all([
    syncJunction(supabase, 'content_categories', 'content_item_id', 'category_id', data.id, formData.category_ids),
    syncJunction(supabase, 'content_meetings',   'content_item_id', 'meeting_id',  data.id, formData.meeting_ids),
  ])

  revalidateAll(formData.category_ids)
  redirect(`/library/item/${data.id}`)
}

// ─── Update ──────────────────────────────────────────────────

export async function updateContent(id: string, formData: ContentFormData): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  const { error } = await supabase
    .from('content_items')
    .update({
      title:        formData.title.trim(),
      content_type: formData.content_type,
      description:  formData.description.trim() || null,
      body:         formData.content_type === 'post' ? (formData.body || null) : null,
      url:          formData.content_type === 'link' ? (formData.url.trim() || null) : null,
      file_url:     formData.content_type === 'file' ? (formData.file_url.trim() || null) : null,
      file_name:    formData.content_type === 'file' ? (formData.file_name.trim() || null) : null,
      published_at: formData.published_at || new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await Promise.all([
    syncJunction(supabase, 'content_categories', 'content_item_id', 'category_id', id, formData.category_ids),
    syncJunction(supabase, 'content_meetings',   'content_item_id', 'meeting_id',  id, formData.meeting_ids),
  ])

  revalidateAll(formData.category_ids)
  revalidatePath(`/library/item/${id}`)
  redirect(`/library/item/${id}`)
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteContent(id: string, redirectTo = '/library'): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  // Junction rows cascade-delete via FK, but let's be explicit
  await Promise.all([
    supabase.from('content_categories').delete().eq('content_item_id', id),
    supabase.from('content_meetings').delete().eq('content_item_id', id),
  ])

  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidateAll()
  redirect(redirectTo)
}

// ─── File upload helper (called from client via API route) ────
// Actual file upload is handled in /api/upload/route.ts
// This just stores the resulting URL in the content item.

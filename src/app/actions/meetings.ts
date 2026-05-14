'use server'
// ============================================================
// Server Actions — Meetings
// All mutations go through here. Every action checks that the
// caller is the admin before touching the database.
// ============================================================
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

// ─── Types ───────────────────────────────────────────────────

export interface MeetingFormData {
  title: string
  meeting_date: string   // ISO datetime string from <input type="datetime-local">
  format: 'in-person' | 'online' | 'hybrid'
  location: string
  zoom_link: string
  notes: string
  presentation_url: string
  recording_url: string
}

// ─── Create ──────────────────────────────────────────────────

export async function createMeeting(formData: MeetingFormData) {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      title:            formData.title.trim(),
      meeting_date:     formData.meeting_date,
      format:           formData.format,
      location:         formData.location.trim()         || null,
      zoom_link:        formData.zoom_link.trim()        || null,
      notes:            formData.notes.trim()            || null,
      presentation_url: formData.presentation_url.trim() || null,
      recording_url:    formData.recording_url.trim()    || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/meetings')
  revalidatePath('/')
  redirect(`/meetings/${data.id}`)
}

// ─── Update ──────────────────────────────────────────────────

export async function updateMeeting(id: string, formData: MeetingFormData) {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  const { error } = await supabase
    .from('meetings')
    .update({
      title:            formData.title.trim(),
      meeting_date:     formData.meeting_date,
      format:           formData.format,
      location:         formData.location.trim()         || null,
      zoom_link:        formData.zoom_link.trim()        || null,
      notes:            formData.notes.trim()            || null,
      presentation_url: formData.presentation_url.trim() || null,
      recording_url:    formData.recording_url.trim()    || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/meetings')
  revalidatePath(`/meetings/${id}`)
  revalidatePath('/')
  redirect(`/meetings/${id}`)
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteMeeting(id: string) {
  if (!(await isAdmin())) throw new Error('Unauthorised')

  const supabase = await createClient()

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/meetings')
  revalidatePath('/')
  redirect('/meetings')
}

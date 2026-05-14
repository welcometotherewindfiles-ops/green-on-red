'use client'
// ============================================================
// MeetingForm — shared add / edit form for meetings.
// Client component: handles local state, validation, and
// calls the server action on submit.
// ============================================================
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { type Meeting } from '@/types'
import { createMeeting, updateMeeting, type MeetingFormData } from '@/app/actions/meetings'

interface Props {
  /** Pass an existing meeting to pre-fill the form (edit mode). */
  meeting?: Meeting
}

// Convert a UTC ISO string from DB → local datetime-local input value
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  // Pad helper
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function MeetingForm({ meeting }: Props) {
  const router = useRouter()
  const isEdit = !!meeting
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state — pre-filled from meeting in edit mode
  const [title, setTitle]                     = useState(meeting?.title ?? '')
  const [meetingDate, setMeetingDate]         = useState(meeting?.meeting_date ? toDatetimeLocal(meeting.meeting_date) : '')
  const [format, setFormat]                   = useState<MeetingFormData['format']>(meeting?.format ?? 'online')
  const [location, setLocation]               = useState(meeting?.location ?? '')
  const [zoomLink, setZoomLink]               = useState(meeting?.zoom_link ?? '')
  const [notes, setNotes]                     = useState(meeting?.notes ?? '')
  const [presentationUrl, setPresentationUrl] = useState(meeting?.presentation_url ?? '')
  const [recordingUrl, setRecordingUrl]       = useState(meeting?.recording_url ?? '')

  function buildFormData(): MeetingFormData {
    return {
      title,
      meeting_date:     meetingDate,
      format,
      location,
      zoom_link:        zoomLink,
      notes,
      presentation_url: presentationUrl,
      recording_url:    recordingUrl,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) { setError('Title is required.'); return }
    if (!meetingDate)   { setError('Date and time are required.'); return }

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMeeting(meeting!.id, buildFormData())
        } else {
          await createMeeting(buildFormData())
        }
        // redirect happens inside the action; this is a fallback
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: '#fdf2f2', border: '1px solid #f5c6c6', color: '#c0392b' }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Core fields ─────────────────────────────────────── */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Meeting details
        </legend>

        {/* Title */}
        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. May Session — Covered Calls"
            required
            className="form-input"
          />
        </Field>

        {/* Date & time */}
        <Field label="Date & time" required>
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={e => setMeetingDate(e.target.value)}
            required
            className="form-input"
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Enter in your local time zone.
          </p>
        </Field>

        {/* Format */}
        <Field label="Format" required>
          <div className="flex gap-3">
            {(['online', 'in-person', 'hybrid'] as const).map(f => (
              <label
                key={f}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all select-none"
                style={{
                  borderColor:       format === f ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor:   format === f ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  color:             format === f ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                  fontWeight:        format === f ? '500' : '400',
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="sr-only"
                />
                {f === 'online' ? 'Online' : f === 'in-person' ? 'In Person' : 'Hybrid'}
              </label>
            ))}
          </div>
        </Field>
      </fieldset>

      <Divider />

      {/* ── Logistics ───────────────────────────────────────── */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Logistics <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>(optional)</span>
        </legend>

        {/* Location */}
        {(format === 'in-person' || format === 'hybrid') && (
          <Field label="Location / address">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. 42 Example St, Sydney NSW 2000"
              className="form-input"
            />
          </Field>
        )}

        {/* Zoom link */}
        {(format === 'online' || format === 'hybrid') && (
          <Field label="Zoom link">
            <input
              type="url"
              value={zoomLink}
              onChange={e => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="form-input"
            />
          </Field>
        )}

        {/* Notes */}
        <Field label="Notes / agenda">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Session agenda, topics to cover, anything members should know before joining…"
            className="form-input resize-none"
          />
        </Field>
      </fieldset>

      <Divider />

      {/* ── Materials (post-meeting) ─────────────────────────── */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Materials <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>(add after the meeting)</span>
        </legend>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
          Pre-study materials are linked from the Content Library. Recording and presentation can be added here.
        </p>

        {/* Recording URL */}
        <Field label="Recording URL" hint="Paste an unlisted YouTube link">
          <input
            type="url"
            value={recordingUrl}
            onChange={e => setRecordingUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="form-input"
          />
        </Field>

        {/* Presentation URL */}
        <Field label="Presentation URL" hint="Google Slides, Canva, or uploaded file URL">
          <input
            type="url"
            value={presentationUrl}
            onChange={e => setPresentationUrl(e.target.value)}
            placeholder="https://..."
            className="form-input"
          />
        </Field>
      </fieldset>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create meeting'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Small layout helpers ──────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: 'var(--color-accent)' }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hint}</p>
      )}
    </div>
  )
}

function Divider() {
  return <hr style={{ borderColor: 'var(--color-border)' }} />
}

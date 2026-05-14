// ============================================================
// PastMeetingCard — most recent past meeting on Home page
// Shows date, title, and quick-access links to recording,
// presentation, and full meeting page.
// ============================================================
import Link from 'next/link'
import { Calendar, Video, FileText, ArrowRight } from 'lucide-react'
import { type Meeting } from '@/types'
import { MeetingFormatBadge } from '@/components/meetings/MeetingFormatBadge'
import { formatDate } from '@/lib/utils'

interface Props {
  meeting: Meeting
  isAdmin: boolean
}

export function PastMeetingCard({ meeting, isAdmin }: Props) {
  const hasRecording = !!meeting.recording_url
  const hasPresentation = !!meeting.presentation_url

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="p-6 sm:p-8">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MeetingFormatBadge format={meeting.format} />
            </div>
            <h3
              className="text-lg sm:text-xl font-semibold leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {meeting.title}
            </h3>
          </div>
          {isAdmin && (
            <Link
              href={`/meetings/${meeting.id}/edit`}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                borderColor: 'var(--color-border)',
                textDecoration: 'none',
              }}
            >
              Edit
            </Link>
          )}
        </div>

        {/* Date */}
        <div
          className="flex items-center gap-2 mb-5 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Calendar size={14} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
          <span>{formatDate(meeting.meeting_date)}</span>
        </div>

        {/* Quick-access material links */}
        {(hasRecording || hasPresentation) && (
          <div className="flex flex-wrap gap-3 mb-5">
            {hasRecording && (
              <a
                href={meeting.recording_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors"
                style={{
                  color: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-light)',
                  textDecoration: 'none',
                }}
              >
                <Video size={14} />
                Watch recording
              </a>
            )}
            {hasPresentation && (
              <a
                href={meeting.presentation_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors"
                style={{
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <FileText size={14} />
                View presentation
              </a>
            )}
          </div>
        )}

        {/* Footer link */}
        <div
          className="pt-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link
            href={`/meetings/${meeting.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            View full meeting notes
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
export function PastMeetingEmpty() {
  return (
    <div
      className="rounded-xl border border-dashed p-8 text-center"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-muted)',
      }}
    >
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
        style={{ backgroundColor: 'var(--color-accent-light)' }}
      >
        <Calendar size={18} style={{ color: 'var(--color-accent)' }} />
      </div>
      <p
        className="text-sm font-medium mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        No past meetings yet
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Previous meetings will appear here after they&apos;ve taken place.
      </p>
    </div>
  )
}

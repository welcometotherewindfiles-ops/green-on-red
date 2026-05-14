// ============================================================
// UpcomingMeetingCard — prominently featured at top of Home
// Shows date, title, format, location/Zoom, pre-study materials
// ============================================================
import Link from 'next/link'
import { Calendar, MapPin, Link as LinkIcon, ArrowRight } from 'lucide-react'
import { type Meeting } from '@/types'
import { MeetingFormatBadge } from '@/components/meetings/MeetingFormatBadge'
import { formatDateTime } from '@/lib/utils'

interface Props {
  meeting: Meeting
  isAdmin: boolean
}

export function UpcomingMeetingCard({ meeting, isAdmin }: Props) {
  const meetingDate = new Date(meeting.meeting_date)
  const dayName = meetingDate.toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Green accent bar at top */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="p-6 sm:p-8">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MeetingFormatBadge format={meeting.format} />
            </div>
            <h3
              className="text-xl sm:text-2xl font-semibold leading-snug"
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

        {/* Date/time */}
        <div
          className="flex items-center gap-2 mb-3 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Calendar size={15} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
          <span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {dayName}
            </span>
            {', '}
            {formatDateTime(meeting.meeting_date)}
          </span>
        </div>

        {/* Location (in-person) */}
        {meeting.location && (
          <div
            className="flex items-center gap-2 mb-3 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <MapPin size={15} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
            <span>{meeting.location}</span>
          </div>
        )}

        {/* Zoom link */}
        {meeting.zoom_link && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <LinkIcon size={15} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
            <a
              href={meeting.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Join Zoom meeting
            </a>
          </div>
        )}

        {/* Notes / description */}
        {meeting.notes && (
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {meeting.notes}
          </p>
        )}

        {/* Footer link */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            href={`/meetings/${meeting.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            View full meeting page
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
export function UpcomingMeetingEmpty({ isAdmin }: { isAdmin: boolean }) {
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
        No upcoming meeting scheduled
      </p>
      {isAdmin ? (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <Link
            href="/meetings"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            Add a meeting
          </Link>
          {' '}to let the club know what&apos;s next.
        </p>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Check back soon — the admin will post the next meeting shortly.
        </p>
      )}
    </div>
  )
}

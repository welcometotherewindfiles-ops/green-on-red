// ============================================================
// Meetings Index — chronological list of all meetings.
// Upcoming at top (soonest first), then past (newest first).
// ============================================================
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getAllMeetings } from '@/lib/data'
import { MeetingFormatBadge } from '@/components/meetings/MeetingFormatBadge'
import { formatDate, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Meetings' }

export default async function MeetingsPage() {
  const [profile, meetings] = await Promise.all([
    getCurrentProfile(),
    getAllMeetings(),
  ])

  const isAdmin = profile?.role === 'admin'
  const now = new Date()

  const upcoming = meetings.filter(m => new Date(m.meeting_date) > now)
  const past     = meetings.filter(m => new Date(m.meeting_date) <= now)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Meetings
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            All upcoming and past club sessions.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/meetings/new"
            className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
          >
            + Add Meeting
          </Link>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {meetings.length === 0 && (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ backgroundColor: 'var(--color-accent-light)' }}
          >
            <Calendar size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            No meetings yet
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {isAdmin
              ? <>Use the <Link href="/meetings/new" style={{ color: 'var(--color-accent)' }}>Add Meeting</Link> button to create the first one.</>
              : 'The admin will post upcoming meetings here soon.'}
          </p>
        </div>
      )}

      {/* ── Upcoming ──────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="mb-12">
          <SectionLabel>Upcoming</SectionLabel>
          <MeetingList meetings={upcoming} isAdmin={isAdmin} isUpcoming />
        </section>
      )}

      {/* ── Past ──────────────────────────────────────────── */}
      {past.length > 0 && (
        <section>
          <SectionLabel>Past meetings</SectionLabel>
          <MeetingList meetings={past} isAdmin={isAdmin} />
        </section>
      )}

      {/* Mobile add button */}
      {isAdmin && (
        <div className="sm:hidden mt-8">
          <Link
            href="/meetings/new"
            className="w-full flex items-center justify-center text-sm font-medium px-4 py-3 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
          >
            + Add Meeting
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Meeting list ──────────────────────────────────────────────

function MeetingList({
  meetings,
  isAdmin,
  isUpcoming = false,
}: {
  meetings: ReturnType<typeof getAllMeetings> extends Promise<infer T> ? T : never
  isAdmin: boolean
  isUpcoming?: boolean
}) {
  return (
    <ul className="space-y-3">
      {meetings.map(meeting => (
        <li key={meeting.id}>
          <Link
            href={`/meetings/${meeting.id}`}
            className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all hover:shadow-md group"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: isUpcoming ? 'var(--color-accent)' : 'var(--color-border)',
              textDecoration: 'none',
              // Subtle left accent for upcoming
              boxShadow: isUpcoming ? 'inset 3px 0 0 var(--color-accent)' : undefined,
            }}
          >
            {/* Date block */}
            <div
              className="shrink-0 w-14 text-center rounded-lg py-2 hidden sm:block"
              style={{ backgroundColor: isUpcoming ? 'var(--color-accent-light)' : 'var(--color-muted)' }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: isUpcoming ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
              >
                {new Date(meeting.meeting_date).toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div
                className="text-2xl font-bold leading-none mt-0.5"
                style={{ color: isUpcoming ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)' }}
              >
                {new Date(meeting.meeting_date).getDate()}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <MeetingFormatBadge format={meeting.format} />
                <span
                  className="text-xs sm:hidden"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {formatDate(meeting.meeting_date)}
                </span>
              </div>
              <p
                className="font-semibold text-base leading-snug group-hover:underline underline-offset-2 truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {meeting.title}
              </p>
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {formatDateTime(meeting.meeting_date)}
                {meeting.location && ` · ${meeting.location}`}
              </p>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mb-4"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {children}
    </h2>
  )
}

// ============================================================
// Individual Meeting Page — shows all meeting details.
// Admin sees Edit + Delete controls inline at the top.
// ============================================================
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Link as LinkIcon, FileText, Video } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getMeetingWithContent } from '@/lib/data'
import { MeetingFormatBadge } from '@/components/meetings/MeetingFormatBadge'
import { PreStudyList } from '@/components/meetings/PreStudyList'
import { DeleteMeetingButton } from '@/components/meetings/DeleteMeetingButton'
import { formatDateTime, getYouTubeEmbedUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMeetingWithContent(id)
  return { title: result?.meeting.title ?? 'Meeting' }
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, result] = await Promise.all([
    getCurrentProfile(),
    getMeetingWithContent(id),
  ])

  if (!result) notFound()

  const { meeting, preMaterials } = result
  const isAdmin = profile?.role === 'admin'
  const isPast = new Date(meeting.meeting_date) <= new Date()
  const embedUrl = meeting.recording_url ? getYouTubeEmbedUrl(meeting.recording_url) : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/meetings"
          className="hover:underline underline-offset-2"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          Meetings
        </Link>
        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {meeting.title}
        </span>
      </nav>

      {/* ── Admin controls ──────────────────────────────────── */}
      {isAdmin && (
        <div
          className="flex items-center gap-3 mb-8 px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest mr-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Admin
          </span>
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              color: 'var(--color-accent)',
              borderColor: 'var(--color-accent)',
              backgroundColor: 'var(--color-accent-light)',
              textDecoration: 'none',
            }}
          >
            Edit meeting
          </Link>
          <DeleteMeetingButton id={meeting.id} />
        </div>
      )}

      {/* ── Meeting header ──────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MeetingFormatBadge format={meeting.format} />
          {isPast && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Past
            </span>
          )}
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {meeting.title}
        </h1>

        {/* Logistics strip */}
        <div className="space-y-2">
          <LogisticsRow icon={Calendar}>
            {formatDateTime(meeting.meeting_date)}
          </LogisticsRow>
          {meeting.location && (
            <LogisticsRow icon={MapPin}>
              {meeting.location}
            </LogisticsRow>
          )}
          {meeting.zoom_link && (
            <LogisticsRow icon={LinkIcon}>
              <a
                href={meeting.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Join Zoom meeting
              </a>
            </LogisticsRow>
          )}
        </div>
      </header>

      <Divider />

      {/* ── Notes / agenda ──────────────────────────────────── */}
      {meeting.notes && (
        <>
          <section className="py-8">
            <SectionLabel>Notes & agenda</SectionLabel>
            <div
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {meeting.notes}
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* ── Pre-study materials ─────────────────────────────── */}
      <section className="py-8">
        <SectionLabel>Pre-study materials</SectionLabel>
        <PreStudyList items={preMaterials} />
        {isAdmin && (
          <div className="mt-4">
            <Link
              href={`/library/new?meeting=${meeting.id}`}
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
            >
              + Link content to this meeting →
            </Link>
          </div>
        )}
      </section>

      {/* ── Recording ───────────────────────────────────────── */}
      {(meeting.recording_url || (isAdmin && isPast)) && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>Recording</SectionLabel>
            {embedUrl ? (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={embedUrl}
                    title={`Recording: ${meeting.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            ) : meeting.recording_url ? (
              <a
                href={meeting.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border"
                style={{
                  color: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-light)',
                  textDecoration: 'none',
                }}
              >
                <Video size={15} />
                Watch recording
              </a>
            ) : isAdmin ? (
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No recording yet.{' '}
                <Link
                  href={`/meetings/${meeting.id}/edit`}
                  style={{ color: 'var(--color-accent)' }}
                >
                  Add a YouTube link →
                </Link>
              </p>
            ) : null}
          </section>
        </>
      )}

      {/* ── Presentation ────────────────────────────────────── */}
      {(meeting.presentation_url || (isAdmin && isPast)) && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>Presentation</SectionLabel>
            {meeting.presentation_url ? (
              <a
                href={meeting.presentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition-colors"
                style={{
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <FileText size={15} />
                View presentation
              </a>
            ) : isAdmin ? (
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No presentation yet.{' '}
                <Link
                  href={`/meetings/${meeting.id}/edit`}
                  style={{ color: 'var(--color-accent)' }}
                >
                  Add a link →
                </Link>
              </p>
            ) : null}
          </section>
        </>
      )}

    </div>
  )
}

// ── Small layout helpers ──────────────────────────────────────

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

function Divider() {
  return <hr style={{ borderColor: 'var(--color-border)' }} />
}

function LogisticsRow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      <Icon size={15} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
      <span>{children}</span>
    </div>
  )
}

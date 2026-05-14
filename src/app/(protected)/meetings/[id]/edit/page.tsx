// ============================================================
// Edit Meeting Page — admin only
// ============================================================
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { getMeetingById } from '@/lib/data'
import { MeetingForm } from '@/components/meetings/MeetingForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const meeting = await getMeetingById(id)
  return { title: meeting ? `Edit — ${meeting.title}` : 'Edit Meeting' }
}

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, meeting] = await Promise.all([
    getCurrentProfile(),
    getMeetingById(id),
  ])

  if (profile?.role !== 'admin') redirect(`/meetings/${id}`)
  if (!meeting) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/meetings"
          className="hover:underline underline-offset-2"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          Meetings
        </Link>
        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <Link
          href={`/meetings/${meeting.id}`}
          className="hover:underline underline-offset-2 truncate max-w-[160px]"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          {meeting.title}
        </Link>
        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Edit
        </span>
      </nav>

      <h1
        className="text-2xl sm:text-3xl font-semibold mb-8 tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Edit meeting
      </h1>

      <div
        className="rounded-xl border p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <MeetingForm meeting={meeting} />
      </div>
    </div>
  )
}

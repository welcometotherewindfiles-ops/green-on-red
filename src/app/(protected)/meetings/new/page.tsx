// ============================================================
// Add Meeting Page — admin only
// ============================================================
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { MeetingForm } from '@/components/meetings/MeetingForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Add Meeting' }

export default async function NewMeetingPage() {
  const profile = await getCurrentProfile()

  // Non-admins get bounced — middleware handles auth, this handles role
  if (profile?.role !== 'admin') redirect('/meetings')

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
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Add meeting
        </span>
      </nav>

      <h1
        className="text-2xl sm:text-3xl font-semibold mb-8 tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Add a meeting
      </h1>

      <div
        className="rounded-xl border p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <MeetingForm />
      </div>
    </div>
  )
}

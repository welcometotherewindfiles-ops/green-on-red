// ============================================================
// Home Page — Server Component (Phase 2)
// Three sections: upcoming meeting, most recent past meeting,
// topic category grid. All data fetched server-side.
// ============================================================
import { getCurrentProfile } from '@/lib/auth'
import {
  getUpcomingMeeting,
  getMostRecentPastMeeting,
  getAllCategories,
} from '@/lib/data'
import {
  UpcomingMeetingCard,
  UpcomingMeetingEmpty,
} from '@/components/home/UpcomingMeetingCard'
import {
  PastMeetingCard,
  PastMeetingEmpty,
} from '@/components/home/PastMeetingCard'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Home',
}

export default async function HomePage() {
  // Fetch everything in parallel — no waterfall
  const [profile, upcomingMeeting, pastMeeting, categories] = await Promise.all([
    getCurrentProfile(),
    getUpcomingMeeting(),
    getMostRecentPastMeeting(),
    getAllCategories(),
  ])

  const isAdmin = profile?.role === 'admin'
  const firstName = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* ── Welcome header ──────────────────────────────────── */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {firstName ? `Hey, ${firstName}.` : 'Welcome back.'}
          </h1>
          <p
            className="text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Here&apos;s what&apos;s happening with the club.
          </p>
        </div>

        {/* Admin shortcut */}
        {isAdmin && (
          <Link
            href="/meetings"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
          >
            + Add Meeting
          </Link>
        )}
      </div>

      {/* ── Upcoming meeting ────────────────────────────────── */}
      <section className="mb-12">
        <SectionLabel>Next Meeting</SectionLabel>
        {upcomingMeeting ? (
          <UpcomingMeetingCard meeting={upcomingMeeting} isAdmin={isAdmin} />
        ) : (
          <UpcomingMeetingEmpty isAdmin={isAdmin} />
        )}
      </section>

      {/* ── Most recent past meeting ─────────────────────────── */}
      <section className="mb-12">
        <SectionLabel>Most Recent Meeting</SectionLabel>
        {pastMeeting ? (
          <PastMeetingCard meeting={pastMeeting} isAdmin={isAdmin} />
        ) : (
          <PastMeetingEmpty />
        )}
      </section>

      {/* ── Topic category grid ──────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionLabel>Browse the Library</SectionLabel>
          <Link
            href="/library"
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            View all →
          </Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

    </div>
  )
}

// ── Shared section label ──────────────────────────────────────────────────────
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

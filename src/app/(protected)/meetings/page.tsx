// ============================================================
// Meetings Section — stub (full implementation Phase 3)
// ============================================================
import { getCurrentProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Meetings' }

export default async function MeetingsPage() {
  const profile = await getCurrentProfile()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Meetings
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Upcoming and past club sessions.
          </p>
        </div>
        {profile?.role === 'admin' && (
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            + Add Meeting
          </button>
        )}
      </div>

      <div
        className="rounded-xl border p-8 text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          No meetings yet. Full meetings section coming in Phase 3.
        </p>
      </div>
    </div>
  )
}

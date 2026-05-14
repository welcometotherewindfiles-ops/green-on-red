// ============================================================
// Home Page — Server Component stub
// Full implementation comes in Phase 2.
// Shows the three sections: upcoming meeting, last meeting,
// and the category grid.
// ============================================================
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Home',
}

export default async function HomePage() {
  const profile = await getCurrentProfile()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Welcome header */}
      <div className="mb-12">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Here&apos;s what&apos;s happening with the club.
        </p>
      </div>

      {/* Upcoming meeting placeholder */}
      <section className="mb-10">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Next Meeting
        </h2>
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No upcoming meeting scheduled yet.
            {profile?.role === 'admin' && (
              <span style={{ color: 'var(--color-accent)' }}>
                {' '}Head to <a href="/meetings" style={{ color: 'var(--color-accent)' }}>Meetings</a> to add one.
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Most recent past meeting placeholder */}
      <section className="mb-10">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Most Recent Meeting
        </h2>
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No past meetings yet.
          </p>
        </div>
      </section>

      {/* Category grid placeholder */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Browse the Library
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { name: 'Strategies', slug: 'strategies', icon: '📈' },
            { name: 'Fundamentals', slug: 'fundamentals', icon: '📚' },
            { name: 'Risk Management', slug: 'risk-management', icon: '🛡️' },
            { name: 'Brokerages', slug: 'brokerages', icon: '🏦' },
            { name: 'Backtesting', slug: 'backtesting', icon: '🔬' },
            { name: 'Automation', slug: 'automation', icon: '⚙️' },
          ].map((cat) => (
            <a
              key={cat.slug}
              href={`/library/${cat.slug}`}
              className="rounded-xl border p-5 transition-all hover:shadow-md group"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                textDecoration: 'none',
              }}
            >
              <div className="text-2xl mb-3">{cat.icon}</div>
              <div
                className="font-medium text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {cat.name}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

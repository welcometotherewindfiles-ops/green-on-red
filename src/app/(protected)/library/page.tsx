// ============================================================
// Library Index — pulls categories live from DB (Phase 2)
// Full content listing per category comes in Phase 4.
// ============================================================
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { getAllCategories } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Library' }

const ICON_MAP: Record<string, string> = {
  strategies:        '📈',
  fundamentals:      '📚',
  'risk-management': '🛡️',
  brokerages:        '🏦',
  backtesting:       '🔬',
  automation:        '⚙️',
}

export default async function LibraryPage() {
  const [profile, categories] = await Promise.all([
    getCurrentProfile(),
    getAllCategories(),
  ])

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Library
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            All club content, organised by topic.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/library/new"
            className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
          >
            + Add Content
          </Link>
        )}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const icon = cat.icon ?? ICON_MAP[cat.slug] ?? '📂'
          return (
            <Link
              key={cat.id}
              href={`/library/${cat.slug}`}
              className="group rounded-xl border p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                textDecoration: 'none',
              }}
            >
              <div className="text-3xl mb-4 select-none">{icon}</div>
              <h2
                className="text-base font-semibold mb-1.5 group-hover:text-[var(--color-accent)] transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {cat.name}
              </h2>
              {cat.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {cat.description}
                </p>
              )}
            </Link>
          )
        })}
      </div>

    </div>
  )
}

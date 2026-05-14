// ============================================================
// Library Index — stub (full implementation Phase 4)
// ============================================================
import { getCurrentProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Library' }

const CATEGORIES = [
  { name: 'Strategies', slug: 'strategies', icon: '📈', description: 'Trading strategies, setups, and playbooks.' },
  { name: 'Fundamentals', slug: 'fundamentals', icon: '📚', description: 'Core concepts, market education, and analysis frameworks.' },
  { name: 'Risk Management', slug: 'risk-management', icon: '🛡️', description: 'Position sizing, stop losses, and portfolio risk.' },
  { name: 'Brokerages', slug: 'brokerages', icon: '🏦', description: 'Broker reviews, platform guides, and comparisons.' },
  { name: 'Backtesting', slug: 'backtesting', icon: '🔬', description: 'Historical testing, data sources, and methodology.' },
  { name: 'Automation', slug: 'automation', icon: '⚙️', description: 'Algorithmic trading, scripts, and workflow tools.' },
]

export default async function LibraryPage() {
  const profile = await getCurrentProfile()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Library
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            All club content organized by topic.
          </p>
        </div>
        {profile?.role === 'admin' && (
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            + Add Content
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.slug}
            href={`/library/${cat.slug}`}
            className="rounded-xl border p-6 transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              textDecoration: 'none',
            }}
          >
            <div className="text-3xl mb-4">{cat.icon}</div>
            <h2
              className="text-base font-semibold mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {cat.name}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {cat.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}

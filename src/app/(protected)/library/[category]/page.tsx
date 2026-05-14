// ============================================================
// Library Category Page — stub (full implementation Phase 4)
// ============================================================
import { getCurrentProfile } from '@/lib/auth'
import { notFound } from 'next/navigation'
import type { CategorySlug } from '@/types'

const CATEGORIES: Record<CategorySlug, { name: string; icon: string; description: string }> = {
  'strategies':       { name: 'Strategies',      icon: '📈', description: 'Trading strategies, setups, and playbooks.' },
  'fundamentals':     { name: 'Fundamentals',    icon: '📚', description: 'Core concepts, market education, and analysis frameworks.' },
  'risk-management':  { name: 'Risk Management', icon: '🛡️', description: 'Position sizing, stop losses, and portfolio risk.' },
  'brokerages':       { name: 'Brokerages',      icon: '🏦', description: 'Broker reviews, platform guides, and comparisons.' },
  'backtesting':      { name: 'Backtesting',     icon: '🔬', description: 'Historical testing, data sources, and methodology.' },
  'automation':       { name: 'Automation',      icon: '⚙️', description: 'Algorithmic trading, scripts, and workflow tools.' },
}

// Don't pre-render at build time — pages are protected and
// require an authenticated Supabase session at runtime.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = CATEGORIES[category as CategorySlug]
  return { title: cat ? cat.name : 'Not Found' }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const cat = CATEGORIES[category as CategorySlug]
  if (!cat) notFound()

  const profile = await getCurrentProfile()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <a
          href="/library"
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          Library
        </a>
        <span className="mx-2" style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {cat.name}
        </span>
      </div>

      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1
              className="text-3xl font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {cat.name}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>{cat.description}</p>
          </div>
        </div>
        {profile?.role === 'admin' && (
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            + Add Content
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
          No content yet in {cat.name}. Full library implementation coming in Phase 4.
        </p>
      </div>
    </div>
  )
}

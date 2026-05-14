// ============================================================
// Library Category Page — pulls category from DB (Phase 2)
// Full content listing comes in Phase 4.
// ============================================================
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { getCategoryBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

const ICON_MAP: Record<string, string> = {
  strategies:        '📈',
  fundamentals:      '📚',
  'risk-management': '🛡️',
  brokerages:        '🏦',
  backtesting:       '🔬',
  automation:        '⚙️',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const cat = await getCategoryBySlug(category)
  return { title: cat ? cat.name : 'Not Found' }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  const [profile, cat] = await Promise.all([
    getCurrentProfile(),
    getCategoryBySlug(category),
  ])

  if (!cat) notFound()

  const isAdmin = profile?.role === 'admin'
  const icon = cat.icon ?? ICON_MAP[cat.slug] ?? '📂'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/library"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          className="hover:underline underline-offset-2"
        >
          Library
        </Link>
        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {cat.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <span className="text-4xl select-none">{icon}</span>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-semibold mb-1 tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {cat.name}
            </h1>
            {cat.description && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {cat.description}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <Link
            href={`/library/new?category=${cat.slug}`}
            className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
          >
            + Add Content
          </Link>
        )}
      </div>

      {/* Content list — Phase 4 */}
      <div
        className="rounded-xl border border-dashed p-10 text-center"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-muted)',
        }}
      >
        <p
          className="text-sm font-medium mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          No content yet in {cat.name}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {isAdmin
            ? 'Use the "Add Content" button to publish the first item here.'
            : 'Content will appear here once the admin publishes something.'}
        </p>
      </div>

    </div>
  )
}

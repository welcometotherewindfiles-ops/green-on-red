// ============================================================
// Library Category Page — live content list (Phase 4)
// ============================================================
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { getCategoryBySlug, getContentByCategory } from '@/lib/data'
import { ContentCard } from '@/components/content/ContentCard'

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

  const [profile, cat, items] = await Promise.all([
    getCurrentProfile(),
    getCategoryBySlug(category),
    getContentByCategory(category),
  ])

  if (!cat) notFound()

  const isAdmin = profile?.role === 'admin'
  const icon = cat.icon ?? ICON_MAP[cat.slug] ?? '📂'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/library"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          className="hover:underline underline-offset-2">
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
            <h1 className="text-3xl sm:text-4xl font-semibold mb-1 tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}>
              {cat.name}
            </h1>
            {cat.description && (
              <p style={{ color: 'var(--color-text-secondary)' }}>{cat.description}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <Link
            href={`/library/new?category=${cat.slug}`}
            className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}>
            + Add Content
          </Link>
        )}
      </div>

      {/* Content list */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Nothing here yet
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {isAdmin
              ? <>Use <Link href={`/library/new?category=${cat.slug}`}
                  style={{ color: 'var(--color-accent)' }}>Add Content</Link> to publish the first item.</>
              : 'Content will appear here once the admin publishes something.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              categorySlug={cat.slug}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Mobile add button */}
      {isAdmin && (
        <div className="sm:hidden mt-8">
          <Link href={`/library/new?category=${cat.slug}`}
            className="w-full flex items-center justify-center text-sm font-medium px-4 py-3 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}>
            + Add Content
          </Link>
        </div>
      )}
    </div>
  )
}

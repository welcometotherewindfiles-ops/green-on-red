// ============================================================
// Individual Content Item Page — renders post/link/file.
// Posts: full article with prose styling.
// Links: description + embedded player (YouTube) or open button.
// Files: description + download button.
// ============================================================
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, FileDown, Calendar, Tag } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { getContentItemWithRelations } from '@/lib/data'
import { DeleteContentButton } from '@/components/content/DeleteContentButton'
import { formatDate, getYouTubeEmbedUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getContentItemWithRelations(id)
  return { title: result?.item.title ?? 'Content' }
}

export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, result] = await Promise.all([
    getCurrentProfile(),
    getContentItemWithRelations(id),
  ])

  if (!result) notFound()

  const { item, categories, meetings } = result
  const isAdmin = profile?.role === 'admin'

  // Determine back-link — first category or library root
  const backCategory = categories[0]
  const backHref = backCategory ? `/library/${backCategory.slug}` : '/library'
  const backLabel = backCategory ? backCategory.name : 'Library'

  // YouTube embed
  const embedUrl = item.content_type === 'link' && item.url
    ? getYouTubeEmbedUrl(item.url)
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/library"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          className="hover:underline underline-offset-2"
        >
          Library
        </Link>
        {backCategory && (
          <>
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <Link
              href={backHref}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
              className="hover:underline underline-offset-2"
            >
              {backCategory.name}
            </Link>
          </>
        )}
        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span
          className="font-medium truncate max-w-[180px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {item.title}
        </span>
      </nav>

      {/* Admin controls */}
      {isAdmin && (
        <div
          className="flex items-center gap-3 mb-8 px-4 py-3 rounded-lg border flex-wrap"
          style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest mr-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Admin
          </span>
          <Link
            href={`/library/${item.id}/edit`}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border"
            style={{
              color: 'var(--color-accent)',
              borderColor: 'var(--color-accent)',
              backgroundColor: 'var(--color-accent-light)',
              textDecoration: 'none',
            }}
          >
            Edit
          </Link>
          <DeleteContentButton id={item.id} redirectTo={backHref} />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Type + date */}
        <div className="flex items-center gap-3 mb-3">
          <TypeBadge type={item.content_type} />
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Calendar size={12} />
            {formatDate(item.published_at)}
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {item.title}
        </h1>

        {item.description && (
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {item.description}
          </p>
        )}

        {/* Category tags */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <Tag size={13} style={{ color: 'var(--color-text-tertiary)' }} />
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/library/${cat.slug}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <hr style={{ borderColor: 'var(--color-border)' }} />

      {/* ── Post body ─────────────────────────────────────────── */}
      {item.content_type === 'post' && (
        <div className="py-8">
          {item.body ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: item.body }}
            />
          ) : (
            <p style={{ color: 'var(--color-text-tertiary)' }}>No content yet.</p>
          )}
        </div>
      )}

      {/* ── Link ──────────────────────────────────────────────── */}
      {item.content_type === 'link' && item.url && (
        <div className="py-8">
          {embedUrl ? (
            /* YouTube embed */
            <div className="rounded-xl overflow-hidden border mb-5" style={{ borderColor: 'var(--color-border)' }}>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ) : null}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border"
            style={{
              color: '#7c6fcd',
              borderColor: '#c8c3e8',
              backgroundColor: '#f0eefb',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={15} />
            {embedUrl ? 'Open on YouTube' : 'Open link'}
          </a>
          <p
            className="mt-3 text-xs truncate"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {item.url}
          </p>
        </div>
      )}

      {/* ── File ──────────────────────────────────────────────── */}
      {item.content_type === 'file' && (
        <div className="py-8">
          <div
            className="flex items-center gap-4 p-5 rounded-xl border"
            style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#fdf3e8' }}
            >
              <FileDown size={22} style={{ color: '#c07030' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {item.file_name ?? item.title}
              </p>
              {item.file_url && (
                <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                  {item.file_url}
                </p>
              )}
            </div>
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#c07030', textDecoration: 'none' }}
              >
                <FileDown size={14} />
                Download
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Associated meetings ───────────────────────────────── */}
      {meetings.length > 0 && (
        <>
          <hr style={{ borderColor: 'var(--color-border)' }} />
          <div className="py-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-text-tertiary)' }}>
              Featured in
            </p>
            <div className="flex flex-wrap gap-2">
              {meetings.map(m => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:shadow-sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                    textDecoration: 'none',
                  }}
                >
                  📅 {m.title}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

// ── Type badge ────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'post' | 'link' | 'file' }) {
  const CONFIG = {
    post: { label: 'Article', color: 'var(--color-accent)',  bg: 'var(--color-accent-light)' },
    link: { label: 'Link',    color: '#7c6fcd',               bg: '#f0eefb' },
    file: { label: 'File',    color: '#c07030',               bg: '#fdf3e8' },
  }
  const c = CONFIG[type]
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

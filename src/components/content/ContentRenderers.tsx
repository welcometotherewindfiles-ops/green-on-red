// ============================================================
// Content Renderers — one per content type.
// PostRenderer: displays rich text HTML safely.
// LinkRenderer: external URL + YouTube auto-embed.
// FileRenderer: download / view button.
// ============================================================
import { ExternalLink, Download, FileText } from 'lucide-react'
import { type ContentItem } from '@/types'
import { getYouTubeEmbedUrl } from '@/lib/utils'

// ─── Post ────────────────────────────────────────────────────

export function PostRenderer({ item }: { item: ContentItem }) {
  if (!item.body) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        No content written yet.
      </p>
    )
  }

  return (
    <div
      className="prose"
      // Safe: body is HTML produced only by TipTap via the admin form.
      // No user-generated public input exists — this is a private,
      // admin-only publishing tool.
      dangerouslySetInnerHTML={{ __html: item.body }}
    />
  )
}

// ─── Link ────────────────────────────────────────────────────

export function LinkRenderer({ item }: { item: ContentItem }) {
  if (!item.url) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        No URL provided.
      </p>
    )
  }

  const embedUrl = getYouTubeEmbedUrl(item.url)

  return (
    <div className="space-y-6">
      {/* YouTube embed */}
      {embedUrl && (
        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
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
      )}

      {/* External link button — always shown so user can open in new tab */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition-colors"
        style={{
          color: 'var(--color-accent)',
          borderColor: 'var(--color-accent)',
          backgroundColor: 'var(--color-accent-light)',
          textDecoration: 'none',
        }}
      >
        <ExternalLink size={14} />
        {embedUrl ? 'Open on YouTube' : 'Open link'}
      </a>

      {/* Raw URL for reference */}
      <p className="text-xs break-all" style={{ color: 'var(--color-text-tertiary)' }}>
        {item.url}
      </p>
    </div>
  )
}

// ─── File ────────────────────────────────────────────────────

export function FileRenderer({ item }: { item: ContentItem }) {
  if (!item.file_url) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        No file attached yet.
      </p>
    )
  }

  const displayName = item.file_name ?? 'Download file'
  const isPdf = displayName.toLowerCase().endsWith('.pdf') ||
                item.file_url.toLowerCase().includes('.pdf')

  return (
    <div
      className="rounded-xl border p-6 flex items-center gap-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* File icon */}
      <div
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-muted)' }}
      >
        <FileText size={22} style={{ color: 'var(--color-accent)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-semibold mb-0.5 truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {displayName}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {isPdf ? 'PDF Document' : 'Document'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPdf && (
          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={13} />
            View
          </a>
        )}
        <a
          href={item.file_url}
          download={item.file_name ?? true}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg text-white"
          style={{ backgroundColor: 'var(--color-accent)', textDecoration: 'none' }}
        >
          <Download size={13} />
          Download
        </a>
      </div>
    </div>
  )
}

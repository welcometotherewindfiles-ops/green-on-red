// ============================================================
// PreStudyList — renders pre-study materials on a meeting page.
// Shows posts, links, and files with appropriate icons.
// ============================================================
import Link from 'next/link'
import { FileText, ExternalLink, File, BookOpen } from 'lucide-react'
import { type ContentItem } from '@/types'

interface Props {
  items: ContentItem[]
}

const TYPE_CONFIG = {
  post: {
    Icon: BookOpen,
    label: 'Article',
    color: 'var(--color-accent)',
    bg: 'var(--color-accent-light)',
  },
  link: {
    Icon: ExternalLink,
    label: 'Link',
    color: '#7c6fcd',
    bg: '#f0eefb',
  },
  file: {
    Icon: File,
    label: 'File',
    color: '#c07030',
    bg: '#fdf3e8',
  },
}

export function PreStudyList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        No pre-study materials linked to this meeting yet.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map(item => {
        const config = TYPE_CONFIG[item.content_type]
        const { Icon } = config

        // Determine where the item links to
        const href =
          item.content_type === 'post'
            ? `/library/post/${item.id}`
            : item.content_type === 'link'
            ? (item.url ?? '#')
            : (item.file_url ?? '#')

        const isExternal = item.content_type !== 'post'

        return (
          <li key={item.id}>
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="flex items-start gap-3 p-3.5 rounded-lg border transition-all hover:shadow-sm group"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                textDecoration: 'none',
              }}
            >
              {/* Type icon */}
              <span
                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5"
                style={{ backgroundColor: config.bg }}
              >
                <Icon size={14} style={{ color: config.color }} />
              </span>

              <div className="flex-1 min-w-0">
                {/* Type badge + title */}
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="text-xs font-medium"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  <span
                    className="font-medium text-sm leading-snug group-hover:underline underline-offset-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Description */}
                {item.description && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.description}
                  </p>
                )}

                {/* URL preview for links */}
                {item.content_type === 'link' && item.url && (
                  <p
                    className="text-xs mt-1 truncate"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {item.url}
                  </p>
                )}

                {/* File name for files */}
                {item.content_type === 'file' && item.file_name && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {item.file_name}
                  </p>
                )}
              </div>

              {/* External arrow */}
              {isExternal && (
                <ExternalLink
                  size={13}
                  className="shrink-0 mt-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                />
              )}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

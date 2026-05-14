// ============================================================
// ContentCard — one row in a category content list.
// Shows type badge, title, description, date, and edit links
// for the admin. Used on category pages.
// ============================================================
import Link from 'next/link'
import { BookOpen, ExternalLink, File, Calendar, Pencil } from 'lucide-react'
import { type ContentItem } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  item: ContentItem
  categorySlug: string
  isAdmin: boolean
}

const TYPE_CONFIG = {
  post: { label: 'Article', Icon: BookOpen, color: 'var(--color-accent)',   bg: 'var(--color-accent-light)' },
  link: { label: 'Link',    Icon: ExternalLink, color: '#7c6fcd',           bg: '#f0eefb' },
  file: { label: 'File',    Icon: File,         color: '#c07030',           bg: '#fdf3e8' },
}

export function ContentCard({ item, categorySlug, isAdmin }: Props) {
  const { label, Icon, color, bg } = TYPE_CONFIG[item.content_type]
  const href = `/library/item/${item.id}`

  return (
    <div
      className="group rounded-xl border transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="p-5 flex items-start gap-4">
        {/* Type icon */}
        <span
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
          style={{ backgroundColor: bg }}
        >
          <Icon size={16} style={{ color }} />
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Type badge + date */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color }}
            >
              {label}
            </span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <Calendar size={11} />
              {formatDate(item.published_at)}
            </span>
          </div>

          {/* Title */}
          <Link
            href={href}
            className="font-semibold text-base leading-snug hover:underline underline-offset-2 block mb-1"
            style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}
          >
            {item.title}
          </Link>

          {/* Description */}
          {item.description && (
            <p
              className="text-sm leading-relaxed line-clamp-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item.description}
            </p>
          )}

          {/* URL preview for links */}
          {item.content_type === 'link' && item.url && (
            <p
              className="text-xs mt-1.5 truncate"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {item.url}
            </p>
          )}
        </div>

        {/* Admin edit button */}
        {isAdmin && (
          <Link
            href={`/library/item/${item.id}/edit`}
            className="shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-text-tertiary)' }}
            title="Edit"
          >
            <Pencil size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}

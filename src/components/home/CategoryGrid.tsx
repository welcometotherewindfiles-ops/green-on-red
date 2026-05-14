// ============================================================
// CategoryGrid — six topic category cards on the Home page
// Data comes from the DB via the categories table (seeded).
// Falls back to hardcoded defaults if the query returns empty.
// ============================================================
import Link from 'next/link'
import { type Category } from '@/types'

// Fallback icon map in case DB icon field is empty
const ICON_MAP: Record<string, string> = {
  strategies:       '📈',
  fundamentals:     '📚',
  'risk-management': '🛡️',
  brokerages:       '🏦',
  backtesting:      '🔬',
  automation:       '⚙️',
}

interface Props {
  categories: Category[]
}

export function CategoryGrid({ categories }: Props) {
  if (categories.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const icon = cat.icon ?? ICON_MAP[cat.slug] ?? '📂'
        return (
          <Link
            key={cat.id}
            href={`/library/${cat.slug}`}
            className="group rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              textDecoration: 'none',
            }}
          >
            <div className="text-2xl mb-3 select-none">{icon}</div>
            <div
              className="font-semibold text-sm mb-1 group-hover:text-[var(--color-accent)] transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {cat.name}
            </div>
            {cat.description && (
              <div
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {cat.description}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

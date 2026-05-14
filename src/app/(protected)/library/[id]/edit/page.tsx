// ============================================================
// Edit Content Page — admin only
// Fetches the item with its existing category + meeting
// relations, then hands them to ContentForm for editing.
// ============================================================
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { getContentItemWithRelations, getAllCategories, getAllMeetingsSimple } from '@/lib/data'
import { ContentForm } from '@/components/content/ContentForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getContentItemWithRelations(id)
  return { title: result ? `Edit — ${result.item.title}` : 'Edit Content' }
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profile, result, allCategories, allMeetings] = await Promise.all([
    getCurrentProfile(),
    getContentItemWithRelations(id),
    getAllCategories(),
    getAllMeetingsSimple(),
  ])

  if (profile?.role !== 'admin') redirect(`/library/item/${id}`)
  if (!result) notFound()

  const { item, categories, meetings } = result

  // ContentForm expects item with categories[] and meetings[] inlined
  const itemWithRelations = { ...item, categories, meetings }

  // Breadcrumb: link back to the first category if there is one
  const primaryCategory = categories[0] ?? null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm flex-wrap">
        <Link
          href="/library"
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          className="hover:underline underline-offset-2"
        >
          Library
        </Link>

        {primaryCategory && (
          <>
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <Link
              href={`/library/${primaryCategory.slug}`}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
              className="hover:underline underline-offset-2"
            >
              {primaryCategory.name}
            </Link>
          </>
        )}

        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <Link
          href={`/library/item/${item.id}`}
          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          className="hover:underline underline-offset-2 truncate max-w-[160px]"
        >
          {item.title}
        </Link>

        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Edit
        </span>
      </nav>

      <h1
        className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Edit content
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Update the details below. Content type cannot be changed after creation.
      </p>

      <div
        className="rounded-xl border p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <ContentForm
          item={itemWithRelations}
          allCategories={allCategories}
          allMeetings={allMeetings}
        />
      </div>

    </div>
  )
}

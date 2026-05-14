// ============================================================
// Add Content Page — admin only
// Pre-selects category/meeting from ?category= and ?meeting=
// query params (both optional).
// ============================================================
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { getAllCategories, getAllMeetingsSimple, getCategoryBySlug } from '@/lib/data'
import { ContentForm } from '@/components/content/ContentForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Add Content' }

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; meeting?: string }>
}) {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'admin') redirect('/library')

  const { category: categorySlug, meeting: meetingId } = await searchParams

  // Fetch all data in parallel; also resolve the category slug → id if provided
  const [allCategories, allMeetings, preselectedCategory] = await Promise.all([
    getAllCategories(),
    getAllMeetingsSimple(),
    categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
  ])

  const defaultCategoryId = preselectedCategory?.id ?? undefined

  // Breadcrumb label — show category name if we came from one
  const breadcrumbCategory = preselectedCategory
    ? { name: preselectedCategory.name, slug: preselectedCategory.slug }
    : null

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

        {breadcrumbCategory && (
          <>
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <Link
              href={`/library/${breadcrumbCategory.slug}`}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
              className="hover:underline underline-offset-2"
            >
              {breadcrumbCategory.name}
            </Link>
          </>
        )}

        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Add content
        </span>
      </nav>

      <h1
        className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Add content
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Choose a type, fill in the details, then tag it to one or more library categories.
      </p>

      <div
        className="rounded-xl border p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <ContentForm
          allCategories={allCategories}
          allMeetings={allMeetings}
          defaultCategoryId={defaultCategoryId}
          defaultMeetingId={meetingId}
        />
      </div>

    </div>
  )
}

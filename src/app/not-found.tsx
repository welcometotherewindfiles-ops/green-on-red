// ============================================================
// Global 404 — rendered outside the protected layout so it
// never tries to call Supabase during static generation.
// ============================================================
import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#c0392b' }}
          />
        </div>
        <p
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-accent)' }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Page not found
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-sm font-medium px-5 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

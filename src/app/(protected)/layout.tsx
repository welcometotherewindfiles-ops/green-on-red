// ============================================================
// Protected Layout
// Wraps all authenticated pages. Renders the Nav and a
// consistent page container.
//
// Auth is fully handled by middleware.ts — no Supabase call
// needed here. The Nav reads the session client-side via
// AuthProvider (already in the root layout).
// ============================================================
import { Nav } from '@/components/layout/Nav'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Nav />
      <main className="flex-1">{children}</main>
      <footer
        className="border-t py-6 mt-16"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Green on Red Investment Club — Private &amp; Members Only
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: '#c0392b' }}
            />
          </span>
        </div>
      </footer>
    </div>
  )
}

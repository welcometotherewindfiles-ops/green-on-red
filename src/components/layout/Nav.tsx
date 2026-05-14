'use client'
// ============================================================
// Main Navigation
// Responsive top nav. Shows user name + sign-out.
// Admin badge visible only to admin users.
// ============================================================
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Menu, X, LogOut } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/meetings', label: 'Meetings' },
  { href: '/library', label: 'Library' },
  { href: '/about', label: 'About' },
]

export function Nav() {
  const pathname = usePathname()
  const { profile, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            style={{ textDecoration: 'none' }}
          >
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#c0392b' }}
              />
            </span>
            <span
              className="text-base font-semibold tracking-tight"
              style={{
                fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
                color: 'var(--color-text-primary)',
              }}
            >
              Green on Red
            </span>
            {isAdmin && (
              <span
                className="hidden sm:inline-block text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent-dark)',
                }}
              >
                Admin
              </span>
            )}
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: isActive(link.href)
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: isActive(link.href)
                    ? 'var(--color-accent-light)'
                    : 'transparent',
                  fontWeight: isActive(link.href) ? '500' : '400',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop user controls */}
          <div className="hidden md:flex items-center gap-3">
            {profile && (
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {profile.full_name ?? profile.email}
              </span>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Sign out"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm"
                style={{
                  color: isActive(link.href)
                    ? 'var(--color-accent)'
                    : 'var(--color-text-primary)',
                  backgroundColor: isActive(link.href)
                    ? 'var(--color-accent-light)'
                    : 'transparent',
                  fontWeight: isActive(link.href) ? '500' : '400',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {profile?.full_name ?? profile?.email}
              {isAdmin && (
                <span
                  className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--color-accent-light)',
                    color: 'var(--color-accent-dark)',
                  }}
                >
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

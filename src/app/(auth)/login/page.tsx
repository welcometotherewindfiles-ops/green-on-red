'use client'
// ============================================================
// Login Page
// Clean, editorial-style login. No self-registration.
// Shows a setup screen if Supabase env vars aren't configured.
// ============================================================
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    !!url &&
    url !== 'your_supabase_project_url' &&
    url.startsWith('http') &&
    !!key &&
    key !== 'your_supabase_anon_key'
  )
}

// ── Setup notice (shown before Supabase is wired up) ──────────────────────────
function SetupNotice() {
  return (
    <div
      className="w-full max-w-sm rounded-xl border p-8 shadow-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-5"
        style={{
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent-dark)',
        }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
        Setup required
      </div>

      <h2
        className="text-lg font-semibold mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Connect your Supabase project
      </h2>
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        This site needs a Supabase project for auth and data.
        Add your credentials to <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-muted)' }}>.env.local</code> to get started.
      </p>

      <ol
        className="space-y-3 text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <li className="flex gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center mt-0.5"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >1</span>
          <span>Go to <a href="https://supabase.com" target="_blank" rel="noopener" style={{ color: 'var(--color-accent)' }}>supabase.com</a> and create a free project</span>
        </li>
        <li className="flex gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center mt-0.5"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >2</span>
          <span>Copy your Project URL and anon key from <strong>Settings → API</strong></span>
        </li>
        <li className="flex gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center mt-0.5"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >3</span>
          <span>
            Paste them into <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-muted)' }}>.env.local</code>:
            <pre
              className="mt-2 p-3 rounded-lg text-xs overflow-x-auto"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-text-primary)' }}
            >{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}</pre>
          </span>
        </li>
        <li className="flex gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center mt-0.5"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >4</span>
          <span>Run the schema in <strong>Supabase → SQL Editor</strong> (see <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-muted)' }}>supabase/schema.sql</code>)</span>
        </li>
        <li className="flex gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center mt-0.5"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >5</span>
          <span>Restart the dev server — this page will become the login form</span>
        </li>
      </ol>
    </div>
  )
}

// ── Login form ────────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // If already logged in, go home
  useEffect(() => {
    ;(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace(redirectTo)
    })()
  }, [router, redirectTo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setError('Invalid email or password. Please try again.')
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-8 shadow-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p
            className="text-sm rounded-lg px-3.5 py-2.5"
            style={{
              color: '#c0392b',
              backgroundColor: '#fdf2f2',
              border: '1px solid #f5c6c6',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 mt-2"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p
        className="mt-6 text-xs text-center"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Access is by invitation only. Contact the admin if you need help.
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const configured = isSupabaseConfigured()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Logo / wordmark */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 mb-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#c0392b' }}
          />
        </div>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{
            fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
            color: 'var(--color-text-primary)',
          }}
        >
          Green on Red
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Investment Club · Members Only
        </p>
      </div>

      {/* Either setup guide or login form */}
      {configured ? (
        <Suspense fallback={<div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">Loading…</div>}>
          <LoginForm />
        </Suspense>
      ) : (
        <SetupNotice />
      )}
    </div>
  )
}

// ============================================================
// Supabase Middleware Client
// Used exclusively inside middleware.ts to refresh sessions
// and enforce route protection.
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that never require auth
  const publicRoutes = ['/login', '/auth/callback']
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r))

  // If Supabase is not yet configured, only allow /login (setup screen)
  if (!isSupabaseConfigured()) {
    if (!isPublicRoute) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: must call getUser() to refresh the session token.
  // Do not remove this.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not authenticated + not on a public route → redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated + trying to visit login → redirect home
  if (user && pathname === '/login') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    homeUrl.searchParams.delete('redirectTo')
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

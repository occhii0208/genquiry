// proxy.ts (旧 middleware.ts)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // proxy.ts

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 💡 公開ページ（未ログインでも見れる場所）を定義
  const isPublicPage = 
    pathname === '/home' || // 🏠 メイン画面をここに追加！
    pathname.startsWith('/topic/local/') || 
    pathname === '/leaderboard' ||
    pathname === '/guide' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/about' ||
    pathname === '/contact'

  const isLoginPage = pathname === '/login'
  const isAuthCallback = pathname.startsWith('/auth')

  // 門番ロジック
  if (!user && !isPublicPage && !isLoginPage && !isAuthCallback) {
    // ログインしていない ＆ 許可されたページでもないなら、ログイン画面へ
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!user && isPublicPage) {
    return response; // 👈 ログインしてなくても通してあげる
  }

  return response
}

// 適用範囲の設定
export const config = {
  // 💡 ここに |auth| を追加して、認証処理をミドルウェアが邪魔しないようにします
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
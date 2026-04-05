// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server' // 💡 NextRequest を追加

export async function GET(request: NextRequest) { // 💡 Request ではなく NextRequest に変更
  // 💡 searchParams の取得を Next.js 推奨の形に
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') || 'signup'
  const next = searchParams.get('next') || '/home'

  //console.log("--- Auth Debug ---");
  //console.log("Code exists:", !!code);
  //console.log("TokenHash exists:", !!token_hash);

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { 
          cookieStore.set({ name, value, ...options }) 
        },
        remove(name: string, options: any) { 
          cookieStore.set({ name, value: '', ...options }) 
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error("Exchange Error:", error.message);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error("OTP Verify Error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
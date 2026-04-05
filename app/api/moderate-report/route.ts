import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 管理者権限を持つクライアント（Service Roleを使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const cookieStore = await cookies()

  // 1. サーバー側でセキュアなクライアントを作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 2. 【セキュリティ強化】getUser() を使用してユーザーを確実に特定
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: '認証が必要です。もう一度ログインしてください。' }, 
      { status: 401 }
    )
  }

  // 3. 検証済みの user.id で管理者フラグを確認
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!adminProfile?.is_admin) {
    return NextResponse.json(
      { error: '管理者権限がありません。' }, 
      { status: 403 }
    )
  }

  // 4. ボディの取得
  const { reportId, action } = await request.json()

  // 5. 通報データの取得
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report || report.status !== 'pending') {
    return NextResponse.json(
      { error: '通報が見つからないか、すでに他の管理者によって処理されています。' }, 
      { status: 404 }
    )
  }

  try {
    if (action === 'approve') {
      // 🔒 【脆弱性対策1】対象の投稿がまだ存在するか（すでに消去されていないか）確認
      const { data: correction } = await supabaseAdmin
        .from('corrections')
        .select('id')
        .eq('id', report.correction_id)
        .single()

      if (!correction) {
        // すでに削除されていた場合は、この通報を「解決済み(resolved)」にして終了
        await supabaseAdmin.from('reports').update({ status: 'resolved' }).eq('id', reportId)
        return NextResponse.json(
          { error: '対象の投稿はすでに別の通報により削除されています。' }, 
          { status: 400 }
        )
      }

      // 🎁 【脆弱性対策2】スコア変動（処理を実行した「最初の1人」と「対象者」のみ）
      await supabaseAdmin.rpc('increment_trust_score', { 
        target_user_id: report.reporter_id, 
        amount: 20 
      })
      await supabaseAdmin.rpc('increment_trust_score', { 
        target_user_id: report.target_user_id, 
        amount: -20 
      })

      // 🧹 【脆弱性対策3】同じ投稿に対する「他の保留中の通報」をすべて「処理済み(resolved)」にする
      // これにより、複数人でのポイント荒稼ぎ（錬金術）を完全に無効化します
      await supabaseAdmin
        .from('reports')
        .update({ status: 'resolved' })
        .eq('correction_id', report.correction_id)
        .eq('status', 'pending')

      // 本命の通報を「承認(approved)」に更新
      await supabaseAdmin.from('reports').update({ status: 'approved' }).eq('id', reportId)

      // 🗑️ 最後に問題の投稿を削除（外部キー制約の設定によっては、ここで紐づくreportsも消える可能性がありますが、スコア処理は完了しているので問題ありません）
      await supabaseAdmin.from('corrections').delete().eq('id', report.correction_id)
      
      return NextResponse.json({ message: '通報を承認しました。第一発見者に報酬を付与し、関連する通報を一括処理しました。' })

    } else if (action === 'reject') {
      // ❌ 却下：虚偽通報ペナルティ（対象者は無傷、通報者のみ-20）
      await supabaseAdmin.rpc('increment_trust_score', { 
        target_user_id: report.reporter_id, 
        amount: -20 
      })
      
      await supabaseAdmin.from('reports').update({ status: 'rejected' }).eq('id', reportId)
      return NextResponse.json({ message: '通報を却下しました（虚偽ペナルティ適用）。' })
    }
  } catch (err: any) {
    console.error('Moderation processing error:', err)
    return NextResponse.json({ error: 'サーバー内部エラーが発生しました。' }, { status: 500 })
  }

  return NextResponse.json({ error: '無効な操作です。' }, { status: 400 })
}
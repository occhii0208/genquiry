import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: '認証が必要です。ログインしてください。' }, { status: 401 })
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const { topicId } = body;
  if (!topicId) return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });

  try {
    // 対象のトピックと、それに紐づく訂正案（いいね含む）を取得
    const { data: topic, error: fetchError } = await supabaseAdmin
      .from('topics')
      .select('*, corrections(*, likes(user_id))')
      .eq('id', topicId)
      .single();

    if (fetchError || !topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    if (!topic.is_current) return NextResponse.json({ error: 'Already updated' }, { status: 400 });
    if (topic.is_generating) return NextResponse.json({ error: 'Generating in progress' }, { status: 409 });

    // 重複実行を防ぐため、生成中フラグを立てる
    await supabaseAdmin.from('topics').update({ is_generating: true }).eq('id', topicId);

    // ==========================================
    // 💡 1. 候補の選定とソート（いいね1件以上のみ）
    // ==========================================
    const validCorrections = (topic.corrections || []).filter((c: any) => (c.likes?.length || 0) >= 1);
    
    validCorrections.sort((a: any, b: any) => {
      const aLikes = a.likes?.length || 0;
      const bLikes = b.likes?.length || 0;
      
      if (bLikes !== aLikes) {
        return bLikes - aLikes; // 優先1：いいねが多い順（降順）
      }
      // 優先2：いいねが同数の場合は、投稿が早い順（昇順）
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const topCorrections = validCorrections.slice(0, 3); // 上位最大3件をAI統合用に抽出

    let actionMessage = '';

    // ==========================================
    // 💡 2. 世代の進化 または 維持・消滅の分岐
    // ==========================================
    if (topCorrections.length > 0) {
      
      // ソート済みの1位（インデックス0）が自動的にベストアンサーとなる
      const bestCorrection = topCorrections[0];
      
      // 【パターンA: 進化】プロンプト作成とAI呼び出し
      const originalquestion = topic.genre
      const originalText = topic.ai_text;
      const correctionTexts = topCorrections.map((c: any, i: number) => `・訂正案${i + 1}: ${c.correction_text}`).join('\n');

      const prompt = `あなたは地域情報の優秀な編集者です。以下の「元の回答」に対して、地元民から複数の訂正案が寄せられました。
これらの訂正案の内容をすべて反映し、矛盾のないように元の文章を書き換えて、新しい文章を1つ作成してください。
客観的な事実のみを記述し、挨拶や「書き換えました」などの前置きは絶対に含めないでください。出力は本文のみとしてください。

【元の質問】
${originalquestion}

【元の回答】
${originalText}

【採用する訂正案】
${correctionTexts}`;

      let generatedText = '';
      try {
        const apiKey = process.env.GEMINI_API_KEY; 
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        const aiData = await aiRes.json();
        if (!aiRes.ok) throw new Error(aiData.error?.message || 'AI生成エラー');
        
        generatedText = aiData.candidates[0].content.parts[0].text.trim();
      } catch (aiError) {
        console.error("AI Error:", aiError);
        throw new Error('AIによる統合に失敗しました。');
      }

      const newAiText = generatedText;

      // 1. 新しい世代（トピック）を作成
      const { data: newTopic, error: insertError } = await supabaseAdmin.from('topics').insert([{
        genre: topic.genre,
        ai_text: newAiText,
        user_id: user.id,
        version: topic.version + 1,
        is_current: true,
        parent_id: topic.id,
        carry_over_count: 0,
        search_tags: topic.search_tags,
        focus_point: topic.focus_point
      }]).select('id').single();

      if (insertError) throw insertError;

      // 2. 報酬（スコア）の付与：ベストアンサー（1名）のみ
      if (bestCorrection.user_id) {
        await supabaseAdmin.rpc('increment_trust_score', {
          target_user_id: bestCorrection.user_id,
          amount: 10
        });
      }

      actionMessage = `新しい世代が生成され、最も支持を集めた早い訂正案がベストアンサーに選ばれました！`;

      // 3. 古いトピックの更新とベストアンサーの記録
      // ※ここで best_correction_id を更新することで、DBの通知トリガーが発動します
      await supabaseAdmin.from('topics').update({ 
        is_current: false, 
        is_generating: false,
        best_correction_id: bestCorrection.id 
      }).eq('id', topicId);

    } else if (topic.carry_over_count < 1) {
      
      // 【パターンB: 維持】いいね不足 -> そのまま引き継いで次世代へ
      await supabaseAdmin.from('topics').insert([{
        genre: topic.genre,
        ai_text: topic.ai_text,
        user_id: user.id, 
        version: topic.version + 1,
        is_current: true,
        parent_id: topic.id,
        carry_over_count: topic.carry_over_count + 1,
        search_tags: topic.search_tags,
        focus_point: topic.focus_point
      }]);
      
      actionMessage = '十分な検証が集まらなかったため、過去の情報を引き継ぎました。';
      
      // 旧トピックの更新（ベストアンサーなし）
      await supabaseAdmin.from('topics').update({ is_current: false, is_generating: false }).eq('id', topicId);

    } else {
      
      // 【パターンC: 消滅】引き継ぎ上限に達したためアーカイブ行き
      actionMessage = 'この情報はアーカイブされました。';
      
      await supabaseAdmin.from('topics').update({ 
        is_current: true, 
        status: 'archived', 
        is_generating: false 
      }).eq('id', topicId);
    }

    return NextResponse.json({ message: actionMessage });

  } catch (error: any) {
    // エラー時は生成中フラグを下ろす
    if (topicId) {
      await supabaseAdmin.from('topics').update({ is_generating: false }).eq('id', topicId);
    }
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
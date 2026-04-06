// app/api/cron/auto-post/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. 一般ユーザーを弾くセキュリティ
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // ==========================================
    // ① AI（Gemini）に「お題（genre）」だけを考えさせる
    // ==========================================
    // 💡 修正：地方都市をランダムに選ばせるためのプロンプト
    const prompt = `あなたは日本の地理やディープなローカル情報を扱うサイトの管理者にお題を渡します。
日本の47都道府県の中から、「有名な観光地や大都市（東京、京都、大阪、札幌など）」が多くなりすぎないように、地方の市町村をランダムに1つ選んでください。
そして、その選んだ都市に関する、観光客や転居者が気になるようなニッチな地域情報や生活ルールに関する「お題（短いテーマ）」を1つだけ出力してください。
※余計な挨拶や説明は一切不要です。文字列だけを出力してください。
例：「群馬県高崎市の暗黙のルール」「静岡県沼津市の給食の独自メニュー」「青森県弘前市の冬の雪かき事情」`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error("Gemini API Error for generating genre");
    }

    const geminiResult = await geminiResponse.json();
    
    // AIが考えたお題（改行や余計な空白を取り除く）
    const generatedGenre = geminiResult.candidates[0].content.parts[0].text.trim();
    console.log("自動生成されたお題:", generatedGenre);

    // ==========================================
    // ② 既存のアプリの機能（/api/generate）にお題を投げて下書きを作らせる
    // ==========================================
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre: generatedGenre }) 
    });

    const data = await generateResponse.json();

    if (!generateResponse.ok || !data.is_valid) {
      throw new Error(data.reason || "既存のAPIでの記事生成に失敗しました");
    }

    // ==========================================
    // ③ 作成されたデータをSupabaseに保存する
    // ==========================================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase
      .from('topics')
      .insert([{ 
        genre: generatedGenre, 
        ai_text: data.ai_text, 
        user_id: process.env.SYSTEM_USER_ID, // システム用ユーザーID
        search_tags: data.search_tags,
        focus_point: data.focus_point,
        is_current: true,
        status: 'active',
        version: 1,
        carry_over_count: 0
      }]);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `「${generatedGenre}」で自動投稿が完了しました` 
    });
    
  } catch (error: any) {
    console.error("Auto post error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
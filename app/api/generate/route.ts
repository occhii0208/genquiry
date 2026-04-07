import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {

  const authHeader = req.headers.get('authorization');
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const cookieStore = await cookies()

  // 1. サーバー側で認証用クライアントを作成
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

  // 2. 【重要】ユーザーがログインしているか確認
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 💡 修正：一般ユーザーが未ログインなら弾くが、Cron（isCronがtrue）なら特別に通す！
  if (!isCron && (authError || !user)) {
    return NextResponse.json(
      { error: "認証が必要です。ログインしてから投稿してください。" }, 
      { status: 401 }
    );
  }

  try {
    const { genre } = await req.json();
    
    // 💡 モデル名は最新のもの（gemini-1.5-flash 等）に合わせるのが一般的です
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      ユーザーの入力：「${genre}」
      
      【判定ルール】
      1. 入力が「特定の地域、観光、地元情報、歴史、グルメ、生活」など、地域Wikiのお題（テーマ）として成立するか判定。
      2. 「〇〇でおすすめは？」のような質問形式であっても、それが特定の地域に関するものであれば「地域情報への関心」とみなし、積極的に is_valid: true としてください。
      
      【重要：拒否条件】
      - 以下の場合は is_valid: false とし、適切な理由(reason)を返してください：
        a. 単なる個人の感情の吐露、好き嫌いの表明（例：「〇〇は嫌い」「〇〇最高」のみ）。
        b. 明らかに地域に関係ない雑談や挨拶。
        c. 差別的、攻撃的、不快な内容。
        d. 意味をなさない単語の羅列。
      - 「好き」「嫌い」という言葉が含まれていても、その後に具体的な「なぜなら〜」という情報深掘りの余地がある場合は、その感情を除去した「情報お題」として再定義できるなら受理しても構いません。しかし、単なる感想文であれば却下してください。
      
      【抽出・生成ルール（is_valid: true の場合）】
      3. 検索用タグ(search_tags): 
         - 検索に役立つ具体的な単語を3〜5語、配列で抽出。
         - 【重要：表記揺れ防止】送り仮名を含まない「名詞」のみを使用してください。
         - 形容詞は名詞化してください（例：「美味しい」→「味」、「安い」→「価格」、「隠れ家的」→「隠れ家」）。
         - 一般的で標準的な用語を優先してください。
      
      4. 内容の核心(focus_point): 
         - その投稿が最も強調している「切り口」を1語（名詞）で抽出。
         - 表記揺れを防ぐため、可能な限り以下の標準語から選択、またはこれに準じた名詞に変換してください。
         [価格, 味, 歴史, 景色, 混雑, 立地, 接客, 雰囲気, 営業時間, 子連れ, デート, 清潔感]

      5. 解説文(ai_text): 
         - 200文字程度。できるだけ事実に基づき、店名や地名など具体的な情報を盛り込んで作成。

      【出力形式】
      必ず以下のJSON形式のみで回答してください。
      {
        "is_valid": boolean,
        "search_tags": ["地域名", "ジャンル", "特徴1", "特徴2"],
        "focus_point": "核心となる単語",
        "ai_text": "文章",
        "reason": "is_validがfalseの場合の理由（日本語）"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // JSON部分のみを抽出する処理
    const data = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
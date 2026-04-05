// app/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-gray-200">
      {/* 利用規約と統一したヘッダー */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/login" className="text-emerald-600 font-bold flex items-center gap-2 hover:opacity-70 transition text-sm">
            <span className="text-lg">←</span> 戻る
          </Link>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Genquiry
          </h1>
          <div className="w-16"></div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-16">
          <h1 className="text-3xl font-black tracking-tight mb-6">プライバシーポリシー</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Genquiry（以下「本サービス」といいます。）は、本サービス上で提供するサービスにおけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>
          <p className="text-sm text-gray-500 mt-4 text-right">
            最終改定日：2026年4月2日
          </p>
        </div>

        <div className="space-y-12 text-sm leading-loose text-gray-700">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第1条（収集する情報）
            </h2>
            <p>本サービスは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>アカウント情報：</strong> メールアドレス、パスワード、ユーザー名、自己紹介等のプロフィール情報。</li>
              <li><strong>サービス利用情報：</strong> 投稿された訂正案、お題の作成履歴、いいねの履歴、信頼スコア、通報履歴、IPアドレス、ブラウザ情報、端末情報等のログ。</li>
              <li><strong>お問い合わせ情報：</strong> お問い合わせ時に提供される氏名や連絡先等。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第2条（利用目的）
            </h2>
            <p>本サービスは、収集した情報を以下の目的で利用します。</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>本サービスへのログイン、本人確認、およびサービスの円滑な提供のため。</li>
              <li>信頼スコアの集計、ランキング表示、およびモデレーション業務（不正利用の防止）のため。</li>
              <li>新機能の案内、メンテナンス、重要なお知らせ等の通知のため。</li>
              <li>ユーザーからの問い合わせに対する回答のため。</li>
              <li>利用規約（第4条）に基づく、投稿テキストのAIモデル開発・学習への利用、およびデータセットとしての解析、商業的活用のため。</li>
              <li>個人を特定できない形に加工した統計データの作成および公開のため。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第3条（個人情報と投稿データの区別）
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスにおいて「個人情報」とは、メールアドレス、パスワード等の個人を直接特定できる情報を指します。これらは厳重に保護され、本人の同意なく第三者に販売または提供されることはありません。</li>
              <li>ユーザーが本サービス上に公開する目的で投稿した「訂正案」や「自己紹介」等のテキストデータは、利用規約に基づき本サービスの資産として活用されるものであり、個人情報保護の対象外（公開情報）として扱われます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第4条（第三者提供の制限）
            </h2>
            <p>本サービスは、法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供することはありません。ただし、以下の場合はこの限りではありません。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>警察、裁判所、またはこれらに準じる公的機関から情報の開示を求められた場合。</li>
              <li>生命、身体、または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合。</li>
              <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第5条（外部サービスの利用）
            </h2>
            <p>本サービスは、機能提供のために以下の外部サービスを利用しています。これらのサービスにおける情報の取扱いは、各サービス提供者のプライバシーポリシーに基づきます。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>認証・データベース：</strong> Supabase（Supabase, Inc.）</li>
              <li><strong>AI API：</strong> Google Gemini API（Google LLC）</li>
              <li><strong>アクセス解析：</strong> Google Analytics 等</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第6条（情報の開示・訂正・削除）
            </h2>
            <p>ユーザーは、自身の個人情報の開示、訂正、または削除を希望する場合、本サービス内のお問い合わせ窓口を通じて請求することができます。本人確認を行った上で、法令に従い速やかに対応いたします。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第7条（継続的改善）
            </h2>
            <p>本サービスは、個人情報の取扱いに関する運用状況を適宜見直し、継続的な改善に努めます。必要に応じて本ポリシーを変更することがあり、変更した場合には本サイト上でお知らせします。</p>
          </section>

        </div>
        
        <div className="mt-24 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-widest">
            © 2026 Genquiry. All rights reserved.
          </p>
        </div>
      </article>
    </main>
  );
}
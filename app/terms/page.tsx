// app/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-gray-200">
      {/* 💡 修正：ヘッダーをGenquiryの標準デザイン（緑の戻るボタンとタイトル）に統一 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/login" className="text-emerald-600 font-bold flex items-center gap-2 hover:opacity-70 transition text-sm">
            <span className="text-lg">←</span> 戻る
          </Link>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Genquiry
          </h1>
          <div className="w-16"></div> {/* 中央揃えのためのスペーサー */}
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-16">
          <h1 className="text-3xl font-black tracking-tight mb-6">利用規約</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            本利用規約（以下「本規約」といいます。）は、Genquiry（以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます。）は、本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>
          <p className="text-sm text-gray-500 mt-4 text-right">
            最終改定日：2026年4月2日
          </p>
        </div>

        <div className="space-y-12 text-sm leading-loose text-gray-700">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第1条（定義）
            </h2>
            <p>本規約において使用する用語の定義は、以下のとおりとします。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>「AI原案」とは、本サービスにおいて生成AIが出力したテキスト等のコンテンツを指します。</li>
              <li>「訂正案」とは、AI原案に対してユーザーが提供する事実に基づく修正、補足、検証の情報、および有用な個人的見解等を指します。</li>
              <li>「世代（GEN）」とは、AI原案とユーザーの訂正案を統合し、新しく生成された情報のバージョンを指します。</li>
              <li>「信頼スコア」とは、ユーザーのプラットフォームへの貢献度を示す本サービス独自の評価指標を指します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第2条（AI生成コンテンツの免責）
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスが提供するAI原案および統合された世代（GEN）のコンテンツは、生成AIの特性上、不正確な情報、古い情報、または架空の情報を含む可能性があります。</li>
              <li>運営者は、本サービス上の情報の正確性、完全性、最新性、および有用性について、いかなる保証も行いません。ユーザーは自身の責任において本サービスを利用し、情報に基づく判断を行うものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第3条（禁止事項）
            </h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。違反が確認された場合、運営者は事前の通知なく、投稿の削除、信頼スコアの減算、またはアカウントの停止措置を行うことができます。</p>
            {/* 💡 修正：「主観的な感想の禁止」を削除し、純粋な荒らしや権利侵害のみを禁止事項として残しました */}
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li><strong>ユーザー間の直接対話・攻撃：</strong> 他のユーザーの投稿に対する返信、議論、誹謗中傷、または挨拶等のコミュニケーション行為。本サービスは情報の収集を目的としており、対話の場ではありません。</li>
              <li><strong>不正なスコア操作：</strong> 複数アカウントの利用、または他ユーザーと結託して「いいね」や通報を不正に操作し、信頼スコアを獲得しようとする行為。</li>
              <li><strong>無断転載・著作権侵害：</strong> 他のウェブサイト、書籍、SNS等から文章をコピー＆ペーストして投稿する行為。</li>
              <li><strong>スパム・宣伝目的の利用：</strong> 特定の店舗やサービスを不当に有利または不利にする目的（ステルスマーケティング等）での意図的な情報操作。</li>
              <li>法令または公序良俗に違反する行為。</li>
              <li>その他、運営者が不適切と判断する行為。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第4条（著作権およびデータの利用権）
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーが本サービスに投稿した訂正案に関する著作権は、原則として投稿したユーザーに帰属します。</li>
              {/* 💡 修正：AI学習、データセットとしての販売、商業利用の許諾を明記し、運営側のビジネス展開の自由度を確保しました */}
              <li>ユーザーは、本サービスに訂正案を投稿した時点で、運営者に対し、当該投稿内容を国内外で無償かつ非独占的に利用（複製、翻案、公衆送信等）する権利を許諾したものとします。この利用には、本サービス内でのAIによる要約・統合のほか、<strong>運営者が自らまたは第三者を通じて行う人工知能（AI）のモデル開発・学習データとしての利用、およびデータセットとしての第三者への提供、販売等の商業的利用</strong>を含みます。</li>
              <li>ユーザーは、運営者および第三者による前項の利用に対して、著作者人格権を行使しないものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第5条（サービスの提供の停止等）
            </h2>
            <p>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合。</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合。</li>
              <li>AI APIプロバイダーのシステム障害や仕様変更により、サービスの継続が困難な場合。</li>
              <li>その他、運営者が本サービスの提供が困難と判断した場合。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第6条（利用規約の変更）
            </h2>
            <p>運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              第7条（準拠法・裁判管轄）
            </h2>
            <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
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
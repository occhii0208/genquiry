// app/guide/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'gen' | 'merit' | 'archive' | 'score' | 'rules'>('gen');

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 pb-20">
      
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/login" className="text-emerald-600 font-bold flex items-center gap-2 hover:opacity-70 transition">
            <span className="text-xl">←</span> 戻る
          </Link>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Genquiry <span className="text-emerald-600 font-medium text-sm">Guide</span>
          </h1>
          <div className="w-16"></div> {/* 中央揃えのためのスペーサー */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Genquiryの使い方
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            AIの原案を、みんなの知識で育てていく。<br />
            ここではGenquiryならではのルールと仕組みを解説します。
          </p>
        </div>

        {/* 💡 タブナビゲーション（4つに増強） */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 overflow-x-auto hide-scrollbar shadow-inner">
          <button 
            onClick={() => setActiveTab('merit')} 
            className={`flex-1 min-w-[100px] py-3 text-[11px] md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'merit' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💡 強み
          </button>
          <button 
            onClick={() => setActiveTab('gen')} 
            className={`flex-1 min-w-[100px] py-3 text-[11px] md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'gen' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌟 進化
          </button>
          <button 
            onClick={() => setActiveTab('archive')} 
            className={`flex-1 min-w-[100px] py-3 text-[11px] md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'archive' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 LIVE/ARCHIVE
          </button>
          <button 
            onClick={() => setActiveTab('score')} 
            className={`flex-1 min-w-[100px] py-3 text-[11px] md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'score' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 スコア
          </button>
          <button 
            onClick={() => setActiveTab('rules')} 
            className={`flex-1 min-w-[100px] py-3 text-[11px] md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'rules' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚖️ 独自ルール
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200 animate-fade-in">
          
          {/* 💡 【新規】タブ2: サイトの強み */}
          {activeTab === 'merit' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900">Genquiry独自の5つの強み</h3>
                <p className="text-sm text-gray-500 mt-2">既存のQ&Aサイトや掲示板が抱えるストレスを、システムで解決しました。</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="text-4xl bg-gray-50 p-3 rounded-xl">🛡️</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">AIが「矢面」に立つから質問者の負担ゼロ</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      ネットで質問すると「そんなことも知らないの？」と叩かれがちですが、ここではAIが不完全な草稿を出す「叩かれ役」になります。あなたはただ「知りたいテーマ」を投げるだけで、誰もあなたを責めません。
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="text-4xl bg-gray-50 p-3 rounded-xl">📝</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">「ツッコミ」を入れるだけだから回答がラク</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      白紙から回答の文章を考えるのは大変ですが、AIの原案という「叩き台」があるため、間違っている部分だけを直す（ツッコミを入れる）だけで済み、知識を共有するハードルが極端に下がります。
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="text-4xl bg-gray-50 p-3 rounded-xl">🕊️</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">感情的な衝突を排除した「安全な質問箱」</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      ユーザー同士の直接対話（返信やレスバ）をシステムレベルで禁止しています。無駄な言い争いやマウントを気にすることなく、純粋な「事実の持ち寄り」に集中できる平和な空間です。
                    </p>
                  </div>
                </div>
                {/* 💡 追加：AIタグ付けによる情報の集約 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="text-4xl bg-gray-50 p-3 rounded-xl">🧲</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">同じ質問が乱立しない「情報の集約」</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      既存の知恵袋では同じような質問が無限に増えて情報が分散しがちですが、GenquiryではAIが投稿内容を分析・タグ付けし、類似のお題があればユーザーをそちらへ誘導します。これにより、1つの記事に濃密な知識が集約されます。
                    </p>
                  </div>
                </div>

                {/* 💡 追加：世代交代による自浄作用 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="text-4xl bg-gray-50 p-3 rounded-xl">✨</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">世代交代による「ノイズの自浄作用」</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      普通の掲示板は情報が古くなったり荒らされたりすると価値を失いますが、Genquiryでは「多くの支持（いいね）を集めた良質な情報」だけを抽出して次世代（GEN）の本文を生成します。ノイズや古い情報がリセットされ、常に洗練された状態に保たれます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ==================== 
              タブ1: GEN（進化）
          ==================== */}
          {activeTab === 'gen' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-emerald-100">
                  Concept
                </div>
                <h3 className="text-2xl font-black text-gray-900">投稿は「世代交代」で正確になる</h3>
                <p className="text-sm text-gray-500 mt-2">AIの不完全な下書きが、地元民の訂正で完成品へと近づきます。</p>
              </div>

              <div className="relative border-l-2 border-emerald-100 ml-4 md:ml-8 pl-8 space-y-10">
                <div className="relative">
                  <div className="absolute -left-[41px] bg-white border-2 border-emerald-200 w-5 h-5 rounded-full"></div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">1. AIが草稿を作成（GEN 1）</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ユーザーが質問をすると、AIがベースとなる回答を作成します。ただし、AIは時々間違えたり、古い情報を出したりします。
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[41px] bg-emerald-500 w-5 h-5 rounded-full shadow-[0_0_0_4px_white]"></div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">2. 地元民による「訂正・ツッコミ」</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    「その店はもう閉店してる！」「そこよりこっちの道の方が早い！」など、リアルな事実を訂正案として追加してください。
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] bg-gradient-to-r from-emerald-400 to-teal-500 w-5 h-5 rounded-full shadow-[0_0_0_4px_white] animate-pulse"></div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">3. 共感を集めて「次世代（GEN）」へ</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    他のユーザーから多くの「いいね👍」を集めた訂正案は、その世代の期限終了時にAIによって元の本文に統合され、記事が「GEN 2」へと進化します！
                  </p>
                  <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 font-bold">
                    💡 期限内に十分な検証（いいね等）が集まらなかった投稿は、アーカイブへ移動し、読み取り専用になります。
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💡 【新規】タブ2: LIVE/アーカイブ */}
          {activeTab === 'archive' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">⌛</div>
                <h3 className="text-2xl font-black text-gray-900">各投稿には「期限」があります</h3>
                <p className="text-sm text-gray-500 mt-2">活発な検証を行い、常に最新の情報を取り込むため、投稿にはライフサイクルを設定しています。</p>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">🟢 LIVE</h4>
                  <p className="text-sm text-emerald-900/80 leading-relaxed">
                    ユーザーの関心が高い投稿です。ユーザーにより事実の検証が行われます。誰でも訂正案の追加や、既存の案への「いいね」が可能です。
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="font-black text-blue-800 mb-3 flex items-center gap-2">⏱️ ユーザーによる期限の操作（延長・更新）</h4>
                  <p className="text-sm text-blue-900/80 leading-relaxed mb-4">
                    LIVE中の記事の期限は固定ではありません。記事についているボタンを押すことで、参加者が進行スピードを操作できます。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                      <p className="font-bold text-blue-700 mb-1 flex items-center gap-1">🛡️ 延長</p>
                      <p className="text-xs text-gray-600 leading-relaxed">「もっと検証・議論する時間が必要だ」「現状の投稿が最適な回答なので世代を進める必要がない」と思った時に押します。1票につき7日期限が延長されます。</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                      <p className="font-bold text-orange-600 mb-1 flex items-center gap-1">🔄 更新</p>
                      <p className="text-xs text-gray-600 leading-relaxed">「十分に検証されたから早く次の世代(GEN)に進めたい、現在の訂正を反映させたい」と思った時に押します。1票につき7日期限が短縮されます。</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200">
                  <h4 className="font-black text-gray-600 mb-2 flex items-center gap-2">📁 ARCHIVE（アーカイブ）</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    ユーザーからの関心があまりない投稿はアーカイブへ移動し、読み取り専用になります。ここにある投稿は、そのままでは進化せず、検証の対象にはなりません。
                  </p>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                  <h4 className="font-black text-amber-800 mb-2 flex items-center gap-2">🔥 知識の復活（Revival）</h4>
                  <p className="text-sm text-amber-900/80 leading-relaxed">
                    アーカイブされた投稿でも、「この投稿に関心がある！」という支持が5票集まれば、再びLIVEへ復活し、検証が再開されます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 
              タブ2: 信頼スコア
          ==================== */}
          {activeTab === 'score' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-black text-gray-900">知識の貢献度を測る「信頼スコア」</h3>
                <p className="text-sm text-gray-500 mt-2">良質な情報を提供し、コミュニティを育てた人に与えられる名誉です。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2">
                    <span>📈</span> スコアが上がる行動
                  </h4>
                  <ul className="space-y-3 text-sm text-emerald-900 font-medium">
                    {/* 💡 修正：項目が詰まってもptが改行されないように whitespace-nowrap を追加、テキストとスコアの間に gap-3 を追加 */}
                    <li className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm gap-3">
                      <span>自分の訂正案に「いいね」される</span>
                      <span className="font-black text-emerald-600 whitespace-nowrap">+1 pt</span>
                    </li>
                    <li className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border-2 border-emerald-200 gap-3">
                      <span>訂正案が最も多くのいいねを集めて次世代(GEN)に採用される</span>
                      <span className="font-black text-emerald-600 whitespace-nowrap">+10 pt</span>
                    </li>
                    <li className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border-2 border-emerald-200 gap-3">
                      <span>不適切な投稿を通報してそれが承認される</span>
                      <span className="font-black text-emerald-600 whitespace-nowrap">+20 pt</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h4 className="font-black text-red-800 mb-4 flex items-center gap-2">
                    <span>📉</span> スコアが下がる行動
                  </h4>
                  <ul className="space-y-3 text-sm text-red-900 font-medium">
                    <li className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm gap-3">
                      <span>通報され、運営に不適切と判断される</span>
                      <span className="font-black text-red-600 whitespace-nowrap">-20 pt</span>
                    </li>
                    <li className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm gap-3">
                      <span>サイトに貢献している普通の投稿を通報した</span>
                      <span className="font-black text-red-600 whitespace-nowrap">-20 pt</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-red-500 mt-4 font-bold">※ スコアが著しくマイナスになった場合のペナルティも実装予定です。</p>
                </div>
              </div>

              {/* 💡 修正：真っ黒な背景をやめ、他のUIと調和するグレーの枠に変更 */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl text-center">
                <h4 className="font-bold text-sm text-gray-800 mb-2">🌟 スコアを貯めるとどうなる？</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  一定のスコアを超えると、ランキングに掲載されたり、何らかのベテラン特権が付与される予定です。
                </p>
              </div>
            </div>
          )}

          {/* 💡 【修正】タブ4: ルール・マナー（会話禁止を追加） */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Genquiryの独自ルール</h3>
              
              <div className="space-y-4">
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                  <h4 className="font-black text-amber-800 mb-2 flex items-center gap-2">
                    <span>🚫</span> ユーザー同士の会話・返信の禁止
                  </h4>
                  <p className="text-sm text-amber-900/80 leading-relaxed">
                    GenquiryはSNS（掲示板）ではなく、「情報の検証所」です。他のユーザーへの反論、挨拶、雑談などの「会話」は一切禁止しています。<br /><br />
                    他の案が違うと思う場合は、会話で指摘するのではなく、「自分自身の正しいと思う訂正案」を別途投稿してください。どちらが正しいかは、コミュニティの「いいね」の数によってのみ決定されます。
                  </p>
                </div>

                {/* 💡 ここを追加：無断転載と自己宣伝の禁止 */}
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                  <h4 className="font-black text-amber-800 mb-2 flex items-center gap-2">
                    <span>🚫</span> 無断転載（コピペ）の禁止
                  </h4>
                  <p className="text-sm text-amber-900/80 leading-relaxed">
                    他のサイト、ブログ、SNS、レビューサイトなどから文章をそのままコピー＆ペーストすることは著作権侵害となるため禁止です。必ずご自身の言葉で書き直して投稿してください。
                  </p>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                  <h4 className="font-black text-amber-800 mb-2 flex items-center gap-2">
                    <span>🚫</span> 過度な自己宣伝・ステマの禁止
                  </h4>
                  <p className="text-sm text-amber-900/80 leading-relaxed">
                    店舗の経営者や関係者が、評価を不当に上げる目的で自作自演の投稿や「いいね」を行うこと（ステルスマーケティング）は情報の信頼性を損なうため禁止しています。発見次第、厳正に対処いたします。
                  </p>
                </div>

                {/* 💡 修正：感想を禁止するのではなく、書き方を誘導する */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-black text-gray-800 mb-2 flex items-center gap-2">
                    <span>✅</span> 感想は「客観的な魅力」に変換して伝える
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    「美味しい」「つまらない」といった個人の主観は人によって意見が割れやすいです。<br /><br />
                    △「ここのラーメンはめっちゃ美味しいです」<br />
                    〇「魚介豚骨スープが特徴で、地元民に行列ができるほど人気です」<br /><br />
                    単なる感想ではなく、できるだけ他の人も納得できる「具体的な魅力や事実」として表現してください。
                  </p>
                </div>
                {/* 💡 ここを追加：「正しいです」という承認の推奨 */}
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                  <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">
                    <span>💡</span> 異論がなければ「正しいです」の一言でOK
                  </h4>
                  <p className="text-sm text-emerald-900/80 leading-relaxed">
                    AIの原案や、すでに組み込まれている記事が完璧で直すところがない場合、無理に粗探しをする必要はありません。<br /><br />
                    「この内容は地元民から見ても正しいです」と一言投稿するだけでも、十分な検証が行われた投稿、ユーザーからの関心がある投稿とみなされ、その記事が次の世代（GEN）へ引き継がれる大きな手助けになります。
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* ボトムアクション */}
        <div className="mt-12 text-center">
          <Link href="/login" className="inline-block bg-gray-900 text-white font-bold px-12 py-4 rounded-xl shadow-md hover:bg-gray-800 transition">
            ログインして参加する
          </Link>
        </div>
      </main>
    </div>
  );
}
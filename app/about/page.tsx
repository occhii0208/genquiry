import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 font-sans">
      
      {/* 💡 共通ヘッダー */}
      {/* 💡 修正した共通ヘッダー */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 relative flex items-center justify-center sticky top-0 z-10">
        <Link 
          href="/" 
          className="absolute left-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition flex items-center"
        >
          ← トップに戻る
        </Link>
        
        <Link 
          href="/" 
          className="text-2xl font-black text-gray-900 tracking-tight hover:opacity-80 transition"
        >
          Genquiry
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-16 px-6">
        
        {/* ページタイトル */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">運営者情報</h1>
          <p className="text-sm text-gray-500 font-bold tracking-widest uppercase">About Genquiry</p>
        </div>

        {/* 項目を並べるエリア */}
        <div className="space-y-8">
          
          {/* セクション1：コンセプト */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              サイトの目的
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
              Genquiryは、AIが生成したベースとなる情報に、専門知識を持った人間ならではの「リアルな知識」を掛け合わせることで、より正確で血の通った情報を創り上げるプラットフォームです。AIの利便性と人間の経験を融合させた、新しい知識共有の形を目指しています。
            </p>
          </section>

          {/* セクション2：運営詳細（テーブル風のリスト） */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              基本情報
            </h2>
            
            <div className="divide-y divide-gray-100">
              <div className="py-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div className="w-32 text-xs font-bold tracking-wider text-gray-400 uppercase">Operator</div>
                <div className="text-gray-900 font-bold">Genquiry 運営事務局</div>
              </div>
              
              <div className="py-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div className="w-32 text-xs font-bold tracking-wider text-gray-400 uppercase">Contact</div>
                <div className="text-gray-900 font-medium text-sm">
                  <Link href="/contact" className="text-emerald-600 font-bold hover:underline">
                    お問い合わせフォーム
                  </Link>
                  よりご連絡ください。
                </div>
              </div>
              
              <div className="py-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div className="w-32 text-xs font-bold tracking-wider text-gray-400 uppercase">Established</div>
                <div className="text-gray-900 font-medium text-sm">2026年 Beta版公開</div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
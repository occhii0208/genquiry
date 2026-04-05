import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 font-sans">
      
      {/* 💡 共通ヘッダー */}
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

      <main className="max-w-2xl mx-auto py-16 px-6">
        
        {/* メインカード */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200 text-center">
          
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">
            ✉️
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">お問い合わせ</h1>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium text-sm md:text-base">
            サービスに関するご意見・不具合のご報告・削除依頼などは、<br className="hidden md:block" />
            以下の専用フォームよりお気軽にお寄せください。
          </p>
          
          {/* 注意書きエリア */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10 text-left">
            <h3 className="font-black text-sm text-gray-900 mb-3">ご返信についてのお願い</h3>
            <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside font-medium leading-relaxed">
              <li>通常、3営業日以内に内容を確認させていただきます。</li>
              <li>内容によってはお時間をいただく場合や、個別のご返信を差し控えさせていただく場合がございます。予めご了承ください。</li>
            </ul>
          </div>

          {/* 送信ボタン */}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSd8oxrTj9i-9utoRqv0rs1LwxPbSOmMTqun5qLo6Do2WocJWg/viewform?usp=header" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-sm group"
          >
            Googleフォームを開く
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
          
        </div>
      </main>
    </div>
  );
}
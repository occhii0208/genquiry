// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* イラストエリア */}
      <div className="relative mb-12">
        {/* 背景の大きな404テキスト */}
        <h1 className="text-[12rem] md:text-[18rem] font-black text-emerald-50 leading-none tracking-tighter">
          404
        </h1>
        {/* 手前のアイコンとテキスト */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-white border-2 border-emerald-100 rounded-3xl flex items-center justify-center text-5xl shadow-lg mb-4">
            🤖
          </div>
          <p className="text-xl font-bold text-gray-900 bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm border border-gray-100 shadow-inner">
            探求中...
          </p>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="max-w-xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">
          AIの知識も、ここまでは届いていないようです。
        </h2>
        <p className="text-gray-600 leading-relaxed font-medium mb-6">
          お探しのページ（情報）は見つかりませんでした。URLが正しいかご確認ください。
        </p>
        <div className="inline-block bg-white p-6 rounded-2xl border border-gray-200 shadow-inner text-left">
          <p className="text-sm font-bold text-gray-800 mb-2">🤖 AIからのメッセージ：</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            「申し訳ありません。このトピックに関する正確なベースとなる情報は、私のデータベース内にも存在しないか、または削除されました。新しいお題を作成するか、トップページに戻ってください。」
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <Link href="/home" className="group inline-flex items-center gap-2 bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-emerald-700 transition shadow-lg text-lg">
        トップページに戻る
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
      </Link>
    </div>
  )
}
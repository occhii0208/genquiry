'use client';

import Auth from '@/components/Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-800">
      
      {/* メインコンテンツエリア */}
      <div className="flex-grow flex flex-col items-center pt-16 md:pt-24 px-4 pb-12">
        
        {/* 1. ヘッダー＆コンセプト */}
        <div className="text-center max-w-2xl mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
            Genquiry <span className="text-emerald-600 text-3xl md:text-4xl align-top font-bold">Beta</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
            AIの原案をみんなの知恵で進化させる、<br className="hidden md:block" />
            質問箱形式の新しい知識共有サービスです。
          </p>
        </div>

        {/* 2. 仕組みの説明（3ステップ） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-20">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">🤖</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">1. AIが下書きを作成</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">気になる地域やテーマを入力すると、まずはAIがサクッとベースとなる草稿を作ります。</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">🗣️</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">2. 地元民がツッコミ＆検証</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">「ここは違う！」「もっといい場所がある！」地元ならではのリアルな情報を追加・修正します。</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-emerald-100 flex flex-col items-center text-center relative overflow-hidden hover:shadow-md transition">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider">GOAL</div>
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">🌟</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">3. いいねが集まり「進化」</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">共感を集めた訂正が本文に組み込まれ、記事が次の世代（GEN）へとアップデートされます！</p>
          </div>

        </div>

        {/* ガイドへのリンク */}
        <div className="flex justify-center mb-16">
          <Link 
            href="/guide" 
            className="group flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full text-sm font-black border border-emerald-100 hover:bg-emerald-100 transition shadow-sm"
          >
            Genquiryの仕組み・信頼スコアについて確認する
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* 3. ログインフォームエリア */}
        <div id="login" className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 scroll-mt-24 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">さっそく参加する</h2>
            <p className="text-xs text-gray-500 font-medium">ログインして、地元の知識をシェアしよう</p>
          </div>
          
          <Auth onGuestLogin={() => router.replace('/home')} />

          {/* 💡 追加：利用規約とプライバシーポリシーへの同意文 */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-gray-500 text-center leading-relaxed font-medium">
            ログインまたはアカウントを作成することにより、<br />
            Genquiryの
            <Link href="/terms" className="text-emerald-600 font-bold hover:underline mx-1">
              利用規約
            </Link>
            および
            <Link href="/privacy" className="text-emerald-600 font-bold hover:underline mx-1">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </div>
        </div>
      </div>

      {/* 4. フッターエリア */}
      <Footer />
    </div>
  );
}
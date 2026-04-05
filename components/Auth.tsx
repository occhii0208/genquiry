'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// 💡 追加：親コンポーネント(page.tsx)から「ゲストログイン処理」を受け取るための型定義
interface AuthProps {
  onGuestLogin: () => void;
}

export default function Auth({}: AuthProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleGoogleLogin = async () => {
    if (!isAgreed) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        // 💡 ここを追加！Googleに毎回アカウント選択画面を出すよう強制します
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) setMessage('Googleログインエラー: ' + error.message);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    
    if (error) {
      // 💡 エラーメッセージの日本語化
      if (error.message.includes('rate limit')) {
        setMessage('【送信制限】短時間に何度も送信されました。セキュリティのため、しばらく（約1時間）時間を置いてから再度お試しください。お急ぎの場合はGoogleログインをご利用ください。');
      } else if (error.message.includes('Too many requests')) {
        setMessage('リクエストが集中しています。しばらく待ってから再度やり直してください。');
      } else {
        setMessage('エラー: ' + error.message);
      }
    } else {
      setMessage('ログイン用のリンクをメールで送信しました！受信箱をご確認ください。');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-3xl font-black mb-2 text-gray-900 tracking-tight">
          Genquiry <span className="text-emerald-600 font-medium text-xl">Beta</span>
        </h2>
        <p className="text-xs text-gray-500 font-bold mb-8 tracking-widest uppercase">
          Login / Register
        </p>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-6 text-left">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              <span>
                <a href="/terms" target="_blank" className="text-emerald-600 hover:underline">利用規約</a>
                と
                <a href="/privacy" target="_blank" className="text-emerald-600 hover:underline">プライバシーポリシー</a>
                に同意します
              </span>
              <br />
              <span className="text-[10px] text-gray-500 mt-1 block">
                ※投稿されたデータは、AIモデルの精度向上等のため第三者へ提供（商用利用）される場合があります。
              </span>
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={!isAgreed}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 opacity-80" alt="G" />
          Googleでサインイン
        </button>

        <div className="flex items-center my-6 text-gray-300">
          <hr className="flex-grow border-gray-200" />
          <span className="px-3 text-xs font-bold uppercase tracking-widest text-gray-400">or email</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4 mb-6">
          <input
            type="email"
            required
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !isAgreed || !email}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {loading ? '送信中...' : 'メールでログイン・新規登録'}
          </button>
        </form>

        {message && (
          <div className="mt-4 mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold rounded-xl text-left leading-relaxed">
            {message}
          </div>
        )}

        {/* 💡 追加：ゲストとして参加するボタン */}
        <div className="pt-4 border-t border-gray-100">
          <button 
            type="button"
            onClick={() => router.push('/home')} // 直接トップページ（公開エリア）へ飛ばす
            className="text-sm font-bold text-gray-400 hover:text-gray-700 transition underline decoration-gray-300 underline-offset-4"
          >
            ゲストとして参加する（閲覧のみ）
          </button>
        </div>

      </div>
    </div>
  );
}
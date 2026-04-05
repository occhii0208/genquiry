'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Period = 'monthly' | 'all'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('monthly')
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaders = async () => {
      setIsLoading(true)
      
      const scoreColumn = period === 'monthly' ? 'monthly_score' : 'trust_score'

      // 💡 修正：第2のソート基準として total_likes_received（総いいね数）を追加
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, trust_score, monthly_score, total_likes_received')
        .gt(scoreColumn, 0)
        .order(scoreColumn, { ascending: false })
        .order('total_likes_received', { ascending: false }) // スコアが同じなら「いいね」が多い順
        .limit(20)

      if (!error && data) {
        // 💡 修正：フロントエンドで「同率順位」を計算して配列に付与する
        const rankedData = data.map((user, index, arr) => {
          const score = period === 'monthly' ? user.monthly_score : user.trust_score;
          // 自分と同じスコアを持つ「最初の人」のインデックスを探す（1位, 2位, 2位, 4位 のロジック）
          const rank = arr.findIndex(u => (period === 'monthly' ? u.monthly_score : u.trust_score) === score) + 1;
          return { ...user, rank, score };
        });
        
        setLeaders(rankedData)
      } else {
        setLeaders([])
      }
      setIsLoading(false)
    }

    fetchLeaders()
  }, [period])

  return (
    <main className="w-full max-w-4xl mx-auto p-4 md:p-8 lg:p-12 min-h-screen bg-[#F9FAFB]">
      <div className="mb-4 md:mb-6">
        <Link href="/home" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition text-sm font-bold gap-1">
          ← 戻る
        </Link>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">信頼スコアランキング</h1>
        <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Top Contributors</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl w-fit border border-gray-200 shadow-inner">
          <button
            onClick={() => setPeriod('monthly')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${
              period === 'monthly' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            月間ランキング
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${
              period === 'all' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            通算ランキング
          </button>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center animate-pulse text-gray-400 font-bold text-sm">
            ランキングを集計中...
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-16 text-center w-full">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-gray-500 font-bold text-sm">まだランクインしている探求者はいません。</p>
            <p className="text-gray-400 font-medium text-xs mt-2">最初のベストアンサーを出して、1位を狙いましょう！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 w-full">
            {leaders.map((user) => {
              // 💡 修正：mapのインデックス(index)ではなく、計算した同率順位(user.rank)を使う
              const isTop = user.rank === 1;

              return (
                <div key={user.id} className="flex items-center justify-between px-6 md:px-10 py-5 hover:bg-gray-50 transition group w-full">
                  <div className="flex items-center gap-5">
                    
                    {/* 💡 修正：順位(user.rank)に応じてメダルの色を変える */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-base shadow-sm
                      ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' : 
                        user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' : 
                        user.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' : 
                        'bg-gray-100 text-gray-400'}`}>
                      {user.rank}
                    </div>
                    
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform" 
                      alt="avatar"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-base">{user.username || '名無しの探求者'}</p>
                      {/* 💡 修正：1位タイの人全員に「トップ探求者」の称号がつくように変更 */}
                      {isTop && <p className="text-xs font-black text-yellow-600 tracking-tighter mt-0.5">トップ探求者</p>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-0.5">
                    <div className="flex items-baseline gap-1.5 bg-emerald-50/50 px-5 py-2.5 rounded-xl border border-emerald-100/50">
                      <span className="text-2xl font-black text-emerald-600">{user.score}</span>
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">pts</span>
                    </div>
                    {/* 💡 同点の時に「総いいね数」で判定されたことが分かるように小さく表示（不要なら消してOKです） */}
                    <p className="text-[9px] text-gray-400 font-bold mr-2">👍 Total {user.total_likes_received}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminPage() {
  // 💡 修正：レポートをそのまま配列で持つのではなく、correction_id をキーにしてグループ化する
  const [groupedReports, setGroupedReports] = useState<{ [key: string]: any[] }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        
        // 💡 修正：getSession ではなく getUser を使用してサーバー側で検証
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          return setLoading(false);
        }

        // 管理者権限があるか DB に問い合わせ
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          return setLoading(false);
        }

        setIsAdmin(true);
        setMyId(user.id);
        fetchReports(); 
      } catch (err) {
        console.error("認証チェックエラー:", err);
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const fetchReports = async () => {
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        corrections(correction_text),
        reporter:profiles!reports_reporter_id_fkey(username),
        target:profiles!reports_target_user_id_fkey(username)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }); // 💡 古い順（第一発見者が先頭になる）

    if (!reportsError && reportsData) {
      // 💡 追加：correction_id（問題の投稿）ごとに通報をまとめる
      const groups = reportsData.reduce((acc: any, report: any) => {
        const cid = report.correction_id;
        if (!acc[cid]) acc[cid] = [];
        acc[cid].push(report);
        return acc;
      }, {});
      setGroupedReports(groups);
    }
    setLoading(false);
  };

  const handleAction = async (primaryReportId: string, correctionId: string, action: 'approve' | 'reject') => {
    const confirmMsg = action === 'approve' 
      ? '【承認】この投稿を削除し、第一発見者にスコアを付与しますか？' 
      : '【却下】この通報を却下し、第一発見者にペナルティを与えますか？';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/moderate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: primaryReportId, action })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'エラーが発生しました');
      
      alert(result.message);
      
      // 💡 承認した場合は、同じ投稿に対する他の通報も画面から消す
      setGroupedReports(prev => {
        const next = { ...prev };
        if (action === 'approve') {
          delete next[correctionId]; // 投稿ごと消す
        } else {
          // 却下の場合は、処理した通報だけ消す（他の人が正当な理由で通報しているかもしれないため）
          next[correctionId] = next[correctionId].filter((r: any) => r.id !== primaryReportId);
          if (next[correctionId].length === 0) delete next[correctionId];
        }
        return next;
      });
    } catch (error: any) {
      alert("エラー: " + error.message);
      fetchReports(); // エラーが起きたら最新状態にリロード
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold animate-pulse">データを読み込み中...</div>;
  if (!isAdmin) return <div className="p-10 text-center text-red-500 font-bold">権限がありません</div>;

  const groupKeys = Object.keys(groupedReports);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-[#F9FAFB] font-sans">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2 text-gray-900">
        🚨 通報管理モデレーション
      </h1>

      <div className="space-y-8">
        {groupKeys.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-4xl mb-4 block">☕</span>
            <p className="text-gray-500 font-bold">未処理の通報はありません。平和です。</p>
          </div>
        ) : (
          groupKeys.map(correctionId => {
            const reportsForThisPost = groupedReports[correctionId];
            const primaryReport = reportsForThisPost[0]; // 💡 最も古い通報（第一発見者）
            const targetUser = primaryReport.target?.username || '不明';
            const problemText = primaryReport.corrections?.correction_text || '取得不可（すでに削除済みの可能性）';

            return (
              <div key={correctionId} className="p-6 border border-red-200 rounded-3xl bg-white shadow-sm overflow-hidden relative">
                {/* ヘッダー部分 */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                      対象の投稿
                    </span>
                    <p className="text-sm font-bold text-gray-500">
                      投稿者: <span className="text-gray-900">@{targetUser}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-500">{reportsForThisPost.length}</span>
                    <span className="text-xs font-bold text-gray-400 ml-1">件の通報</span>
                  </div>
                </div>

                {/* 問題のテキスト */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-6 relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400 rounded-l-2xl"></div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium pl-2 whitespace-pre-wrap">
                    {problemText}
                  </p>
                </div>

                {/* 通報者リスト（第一発見者をハイライト） */}
                <div className="mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">通報したユーザーと理由</p>
                  <div className="space-y-2">
                    {reportsForThisPost.map((r, index) => (
                      <div key={r.id} className={`flex items-center justify-between p-3 rounded-xl border ${index === 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          {index === 0 && <span className="bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded font-black">第1発見者</span>}
                          <span className="text-sm font-bold text-gray-700">@{r.reporter?.username || '不明'}</span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">{r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* アクションボタン（第一発見者のIDを使ってAPIを叩く） */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleAction(primaryReport.id, correctionId, 'reject')} 
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                  >
                    第一発見者の通報を却下 (-20pt)
                  </button>
                  <button 
                    onClick={() => handleAction(primaryReport.id, correctionId, 'approve')} 
                    className="flex-1 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition text-sm shadow-md"
                  >
                    承認して投稿を削除 (第一発見者に+20pt)
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
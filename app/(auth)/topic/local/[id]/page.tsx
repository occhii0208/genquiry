'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

export default function TopicDetail() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [topic, setTopic] = useState<any>(null);
  
  const [allCorrections, setAllCorrections] = useState<any[]>([]);
  const VISIBLE_PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(VISIBLE_PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // 💡 追加：新規投稿用のステート
  const [correctionInput, setCorrectionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 💡 修正：getUser() を使用してセッションをより安全に取得
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setSession({ user });
    };
    
    checkUser();
    fetchTopicData();
  }, [id]);

  const fetchTopicData = async () => {
    setLoading(true);
    const { data: topicData } = await supabase
      .from('topics')
      .select('*, profiles(username)')
      .eq('id', id)
      .single();
    setTopic(topicData);

    const { data: correctionsData } = await supabase
      .from('corrections')
      .select(`
        *,
        profiles(username),
        likes(user_id)
      `)
      .eq('topic_id', id);

    if (correctionsData) {
      sortAndSetCorrections(correctionsData);
    }
    setLoading(false);
  };

  const sortAndSetCorrections = (data: any[]) => {
    const sorted = [...data].sort((a: any, b: any) => {
      const aCount = a.likes?.length || 0;
      const bCount = b.likes?.length || 0;
      if (bCount !== aCount) return bCount - aCount;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    setAllCorrections(sorted);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + VISIBLE_PAGE_SIZE);
  };

  // 💡 追加：訂正案を送信する関数
  const handleSubmitCorrection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('投稿するにはログインが必要です');
    if (!correctionInput.trim()) return toast.error('訂正内容を入力してください');

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('corrections').insert([{
        topic_id: id,
        user_id: user.id,
        correction_text: correctionInput.trim()
      }]);

      if (error) throw error;

      // 投稿成功後、フォームを空にしてデータを再取得
      setCorrectionInput('');
      await fetchTopicData();
      
    } catch (error: any) {
      toast.error('投稿エラー: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCorrection = async (correctionId: string) => {
    if (!window.confirm('本当にこの投稿を削除しますか？\n（獲得した「いいね」もすべて消去されます）')) {
      return;
    }

    setAllCorrections(prev => prev.filter(c => c.id !== correctionId));

    try {
      const { error } = await supabase.from('corrections').delete().eq('id', correctionId);
      if (error) throw error;
    } catch (error: any) {
      toast.error('削除中にエラーが発生しました: ' + error.message);
      fetchTopicData();
    }
  };

  const handleReport = async (correctionId: string, targetUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('通報するにはログインが必要です');
    if (user.id === targetUserId) return toast.error('自分の投稿は通報できません');

    const reason = window.prompt('通報の理由を入力してください\n（例：スパム、不適切な言葉、虚偽の情報）');
    if (!reason) return;

    const { error } = await supabase.from('reports').insert([{
      reporter_id: user.id,
      target_user_id: targetUserId,
      correction_id: correctionId,
      reason: reason
    }]);

    if (!error) {
      toast.success('通報を受理しました。運営が確認いたします。');
    } else {
      toast.error('エラーが発生しました: ' + error.message);
    }
  };

  const handleLike = async (correctionId: string, targetUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('ログインが必要です');
    const myId = user.id;

    const updated = allCorrections.map(cor => {
      if (cor.id === correctionId) {
        const alreadyLiked = cor.likes?.some((l: any) => l.user_id === myId);
        const newLikes = alreadyLiked 
          ? cor.likes.filter((l: any) => l.user_id !== myId)
          : [...(cor.likes || []), { user_id: myId }];
        return { ...cor, likes: newLikes };
      }
      return cor;
    });
    sortAndSetCorrections(updated);

    const { data: existing } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', myId)
      .eq('correction_id', correctionId)
      .single();

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('likes').insert([{ user_id: myId, correction_id: correctionId }]);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/topic/local/${topic.id}`;
    const shareText = `【Genquiry】「${topic.genre}」について、地元民の知恵で検証中！\n#Genquiry`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'Genquiry',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        //console.log('シェアをキャンセルしました');
      }
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    }
  };

  // 💡 handleSubmitCorrection の下あたりに追加
  const handleTimeControl = async (action: 'EXTEND' | 'HASTEN') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('ログインが必要です');
    const myId = user.id;

    // 1. 楽観的UI更新 (画面だけ先に変える)
    const controls = topic.topic_time_controls || [];
    const existing = controls.find((c: any) => c.user_id === myId);
    let newControls = [...controls];
    let daysChange = 0;

    if (existing) {
      if (existing.action_type === action) {
        newControls = newControls.filter((c: any) => c.user_id !== myId);
        daysChange = action === 'EXTEND' ? -7 : 7;
      } else {
        newControls = newControls.map((c: any) => c.user_id === myId ? { ...c, action_type: action } : c);
        daysChange = action === 'EXTEND' ? 14 : -14;
      }
    } else {
      newControls.push({ user_id: myId, action_type: action });
      daysChange = action === 'EXTEND' ? 7 : -7;
    }

    const currentExpires = new Date(topic.expires_at);
    currentExpires.setDate(currentExpires.getDate() + daysChange);

    setTopic({ 
      ...topic, 
      topic_time_controls: newControls, 
      expires_at: currentExpires.toISOString() 
    });

    // 2. DB更新
    try {
      const { data: existingControl } = await supabase
        .from('topic_time_controls')
        .select('*')
        .eq('topic_id', topic.id)
        .eq('user_id', myId)
        .maybeSingle();

      if (existingControl) {
        if (existingControl.action_type === action) {
          await supabase.from('topic_time_controls').delete().eq('id', existingControl.id);
        } else {
          await supabase.from('topic_time_controls').update({ action_type: action }).eq('id', existingControl.id);
        }
      } else {
        await supabase.from('topic_time_controls').insert([{ topic_id: topic.id, user_id: myId, action_type: action }]);
      }
    } catch (err: any) {
      toast.error('エラーが発生しました: ' + err.message);
      fetchTopicData(); // エラー時は元に戻す
    }
  };

  // 💡 追加：前後の世代のページへ遷移する機能
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateGen = async (direction: 'prev' | 'next') => {
    setIsNavigating(true);
    try {
      if (direction === 'prev') {
        if (!topic.parent_id) return;
        // 前の世代のページへ移動
        router.push(`/topic/local/${topic.parent_id}`);
      } else {
        // 次の世代は parent_id が「今のID」になっているものを探す
        const { data, error } = await supabase
          .from('topics')
          .select('id')
          .eq('parent_id', topic.id)
          .single();

        if (error || !data) {
          toast.error('次の世代が見つかりませんでした。');
          return;
        }
        // 次の世代のページへ移動
        router.push(`/topic/local/${data.id}`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  if (loading && !topic) return <div className="p-12 text-center text-gray-400 font-bold animate-pulse">データを読み込み中...</div>;
  if (!topic) return <div className="p-12 text-center text-gray-400">記事が見つかりませんでした。</div>;

  const isPastGen = !topic.is_current;
  const msLeft = new Date(topic.expires_at).getTime() - new Date().getTime();
  const isExpired = msLeft <= 0;
  const canInteract = topic.is_current && !isExpired;

  // 💡 return ( の直前に追加
  const msFromCreation = topic ? new Date().getTime() - new Date(topic.created_at).getTime() : 0;
  const isProtected = msFromCreation < 1000 * 60 * 60 * 24 * 3;
  const myControl = topic?.topic_time_controls?.find((c: any) => c.user_id === session?.user?.id);

  let timeLeftText = isPastGen 
    ? 'アーカイブ' 
    : isExpired 
      ? '期限切れ' 
      : msLeft < 1000 * 60 * 60 * 24 
        ? `残り: ${Math.floor(msLeft / (1000 * 60 * 60))} 時間` 
        : `残り: ${Math.floor(msLeft / (1000 * 60 * 60 * 24))} 日`;

  const visibleCorrections = allCorrections.slice(0, visibleCount);

  return (
    // 💡 修正：フッターを常に下に配置するため flex flex-col を追加
    <main className="max-w-5xl mx-auto p-4 md:p-12 font-sans text-gray-800 bg-[#F9FAFB] min-h-screen flex flex-col">
      
      {/* 💡 修正：メインコンテンツを flex-grow で囲む */}
      <div className="flex-grow">
        <header className="mb-12">
          <button 
            onClick={() => router.back()} 
            className="text-emerald-600 text-sm font-bold hover:underline mb-8 block transition-all text-left"
          >
            ← 前のページに戻る
          </button>
          
          {isPastGen && (
            <div className="bg-gray-100 border border-gray-200 text-gray-500 font-bold p-4 rounded-xl mb-8 text-center text-sm shadow-sm flex items-center justify-center gap-2">
              🗄️ この記事は過去の世代（アーカイブ）のため、閲覧のみ可能です。
            </div>
          )}
          {topic.is_current && isExpired && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 font-bold p-4 rounded-xl mb-8 text-center text-sm shadow-sm flex items-center justify-center gap-2">
              ⏳ この記事は検証期間が終了したため、現在操作できません。トップページから次世代へ更新してください。
            </div>
          )}

          <section className={`bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden ${isPastGen ? 'opacity-90' : ''}`}>
            <div className={`absolute top-0 left-0 w-2 h-full ${isPastGen ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
            
            <div className="flex items-start w-full mb-8">
              <div className="flex flex-col gap-3 max-w-[85%]">
              <div className="flex items-center gap-3 flex-wrap">
                  {/* 💡 変更：静的なspanを、クリックできるナビゲーションボタンに変更 */}
                  <div className={`flex items-center rounded-lg shadow-sm border overflow-hidden flex-shrink-0 ${isPastGen ? 'bg-gray-100 border-gray-200' : 'bg-emerald-50 border-emerald-100'}`}>
                    <button 
                      onClick={() => handleNavigateGen('prev')} 
                      disabled={topic.version <= 1 || isNavigating} 
                      className={`px-3 py-1.5 text-[10px] font-black transition disabled:opacity-30 disabled:cursor-not-allowed ${isPastGen ? 'text-gray-500 hover:bg-gray-200' : 'text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      ◀
                    </button>
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase border-x tracking-widest ${isPastGen ? 'border-gray-200 text-gray-600 bg-gray-200/50' : 'border-emerald-100 text-emerald-800 bg-emerald-100'}`}>
                      GEN {topic.version}
                    </span>
                    <button 
                      onClick={() => handleNavigateGen('next')} 
                      disabled={topic.is_current || isNavigating} 
                      className={`px-3 py-1.5 text-[10px] font-black transition disabled:opacity-30 disabled:cursor-not-allowed ${isPastGen ? 'text-gray-500 hover:bg-gray-200' : 'text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      ▶
                    </button>
                  </div>
                  
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${canInteract && msLeft < 1000 * 60 * 60 * 24 ? 'text-red-500 animate-pulse' : isPastGen ? 'text-gray-400' : 'text-amber-600'}`}>
                    ⌛ {timeLeftText}
                  </span>
                </div>

                {/* 💡 追加：タイトルの上にタグを表示（トップページと同じスッキリしたグレー） */}
                {topic.search_tags && topic.search_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {topic.search_tags.map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200 uppercase tracking-tighter"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <h1 className="text-2xl font-black text-gray-900 leading-relaxed">
                  {topic.genre}
                </h1>
              </div>

              <div className="flex-grow"></div>

              <div className="flex-shrink-0 ml-4">
                <button 
                  onClick={handleShare}
                  className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                  title="シェアする"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className={`p-6 rounded-2xl border ${isPastGen ? 'bg-gray-100 border-gray-200' : 'bg-amber-50/50 border-amber-100/50'}`}>
                <h2 className="text-xs font-bold mb-3 text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🤖</span> AIによる元の草稿
                  {topic.focus_point && (
                    <span className="text-gray-500 ml-1 normal-case text-[10px]">
                      / 「<span className="font-black underline decoration-gray-300 underline-offset-2">{topic.focus_point}</span>」に注目
                    </span>
                  )}
                </h2>
                <p className="text-gray-800 font-medium leading-relaxed text-base">
                  {topic.ai_text}
                </p>
              </div>

              {/* 💡 ここから追加：期間操作ボタンエリア */}
              {canInteract && (
                <div className="py-4 border-t border-gray-50 border-dashed space-y-2 mt-4">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center mb-3">
                    ⏰ この検証の期間を操作する
                  </h3>
                  
                  {isProtected && (
                    /* 💡 変更：付箋の黄色と被らないよう、色をスレート（青灰色）にし、アイコンをロック(🔒)に変更 */
                    <p className="text-[10px] font-bold text-slate-600 text-center bg-slate-100 rounded py-1.5 border border-slate-200 mb-3 mx-auto max-w-sm">
                      🔒 投稿から3日間は期間操作できません
                    </p>
                  )}
                  
                  <div className="flex gap-3 max-w-sm mx-auto">
                    <button 
                      onClick={() => handleTimeControl('EXTEND')} 
                      disabled={isProtected}
                      className={`flex-1 text-[11px] py-3 rounded-xl font-bold transition shadow-sm border ${
                        isProtected 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                          : myControl?.action_type === 'EXTEND' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                      }`}
                    >
                      🛡️ 検証を延長 (+7日)
                    </button>
                    <button 
                      onClick={() => handleTimeControl('HASTEN')} 
                      disabled={isProtected}
                      className={`flex-1 text-[11px] py-3 rounded-xl font-bold transition shadow-sm border ${
                        isProtected 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                          : myControl?.action_type === 'HASTEN' 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                      }`}
                    >
                      🔄 世代を早める (-7日)
                    </button>
                  </div>
                </div>
              )}
              {/* 💡 追加ここまで */}
            </div>
          </section>
        </header>

        <section className="space-y-8">
          <div className="flex justify-between items-end border-b border-gray-200 pb-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              📊 地元民による訂正案 <span className="text-emerald-600 text-sm font-medium">({allCorrections.length}件)</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">いいね数が多い順に表示しています</p>
          </div>

          {/* 💡 投稿フォーム（操作可能な場合のみ表示） */}
          {canInteract && (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm mb-8 animate-fade-in relative">
              <div className="absolute -top-3 -left-2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm transform -rotate-2">
                YOUR KNOWLEDGE
              </div>
              <h3 className="text-sm font-black text-gray-800 mb-3 ml-2 mt-2">
                このAIの草稿を修正・補足する
              </h3>
              {session?.user ? (
                <>
                  <div className="relative">
                    <textarea
                      // 💡 修正：maxLength属性でシステム的にも1000文字でブロック
                      maxLength={1000}
                      className="w-full p-4 pb-8 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none h-32"
                      placeholder="「ここは実は○○です」「こんな歴史もあります」など、地元民ならではの知恵を書き込んでください。"
                      value={correctionInput}
                      onChange={(e) => setCorrectionInput(e.target.value)}
                      disabled={isSubmitting}
                    />
                    
                    {/* 💡 追加：文字数カウンター */}
                    <div className={`absolute bottom-3 right-4 text-xs font-bold ${
                      correctionInput.length >= 950 ? 'text-red-500 animate-pulse' : 
                      correctionInput.length >= 800 ? 'text-amber-500' : 
                      'text-gray-400'
                    }`}>
                      {correctionInput.length} / 1000
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSubmitCorrection}
                      // 💡 修正：1000文字を超えた場合もボタンを無効化（念のため）
                      disabled={isSubmitting || !correctionInput.trim() || correctionInput.length > 1000}
                      className="bg-emerald-600 text-white font-bold py-2.5 px-8 rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {isSubmitting ? '投稿中...' : '検証を投稿する'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-bold mb-3">訂正を投稿するにはログインが必要です</p>
                  <Link href="/login" className="inline-block bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg text-xs hover:bg-emerald-700 transition">
                    ログイン・新規登録
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {visibleCorrections.map((cor, index) => {
              const likeCount = cor.likes?.length || 0;
              const isBest = index === 0 && likeCount > 0;
              const isMyLike = cor.likes?.some((l: any) => l.user_id === session?.user?.id);
              const isMyCorrection = session?.user?.id === cor.user_id;

              return (
                <div 
                  key={cor.id} 
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                    isBest && !isPastGen ? 'border-emerald-500 shadow-md scale-[1.01]' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {isBest && (
                    <div className={`absolute -top-3 left-6 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm z-10 ${isPastGen ? 'bg-gray-400' : 'bg-emerald-500'}`}>
                      🏆 Best Verified Answer
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <Link href={`/profile/${cor.user_id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 transition-transform group-hover:scale-110 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cor.user_id}`} alt="avatar" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-gray-800 group-hover:text-emerald-600 block transition-colors">@{cor.profiles?.username || '名無しの編集者'}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Local Expert</span>
                      </div>
                    </Link>
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(cor.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="text-gray-900 font-medium leading-relaxed mb-8 text-base whitespace-pre-wrap px-1">
                    {cor.correction_text}
                  </p>

                  <div className="flex justify-between items-center border-t border-gray-50 pt-5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => canInteract && !isMyCorrection && handleLike(cor.id, cor.user_id)}
                        disabled={!canInteract || isMyCorrection}
                        className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all ${
                          !canInteract || isMyCorrection
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                            : isMyLike 
                              ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                              : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100'
                        }`}
                      >
                        <span className="text-base leading-none">{isMyLike ? '✅' : '👍'}</span>
                        {isMyCorrection ? '自分の投稿' : '役立った！'}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${(!canInteract || isMyCorrection) ? 'bg-gray-200 text-gray-500' : isMyLike ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {likeCount}
                        </span>
                      </button>

                      {canInteract && session?.user && session.user.id !== cor.user_id && (
                        <button 
                          onClick={() => handleReport(cor.id, cor.user_id)} 
                          className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition underline underline-offset-2 decoration-gray-300 hover:decoration-red-300"
                        >
                          通報する
                        </button>
                      )}

                      {canInteract && session?.user && session.user.id === cor.user_id && (
                        <button 
                          onClick={() => handleDeleteCorrection(cor.id)} 
                          className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition underline underline-offset-2 decoration-gray-300 hover:decoration-red-300"
                        >
                          削除する
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 💡 修正：フォームが上にあるので、0件のときの表示を控えめに変更 */}
            {allCorrections.length === 0 && (
              <div className="text-center py-16 bg-transparent border-2 border-dashed border-gray-200 rounded-3xl space-y-2">
                <div className="text-3xl opacity-50">🔎</div>
                <p className="text-gray-400 font-bold text-sm">まだ訂正案が届いていません</p>
                {canInteract && (
                  <p className="text-emerald-600 font-bold text-xs mt-2">
                    ↑ 上のフォームから、あなたが最初の知恵を投稿してください！
                  </p>
                )}
              </div>
            )}

            {visibleCount < allCorrections.length && (
              <div className="mt-8 flex justify-center pb-8">
                <button 
                  onClick={loadMore}
                  className="bg-white border border-gray-200 text-gray-600 font-bold px-12 py-4 rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                  さらに回答を見る ({allCorrections.length - visibleCount}件)
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 💡 【新規】共通フッターコンポーネントを配置 */}
      <Footer />
    </main>
  );
}
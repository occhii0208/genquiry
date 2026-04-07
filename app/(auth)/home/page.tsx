'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import { TrophyIcon } from '@heroicons/react/24/solid';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

export default function Home() {

  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');

  const [avatarSeed, setAvatarSeed] = useState<string>('');

  const [isArchiveMode, setIsArchiveMode] = useState(false);

  const [genre, setGenre] = useState('');
  const [confirmedGenre, setConfirmedGenre] = useState('');
  const [aiText, setAiText] = useState('「AIに下書きを作成させる」を押すと、ここに草稿が表示されます。');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  // 💡 追加：AIが抽出したデータと重複トピックを管理するステート
  const [extractedData, setExtractedData] = useState<any>(null);
  const [duplicateTopics, setDuplicateTopics] = useState<any[]>([]);

  const [topics, setTopics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [showDiffInput, setShowDiffInput] = useState(false);
  const [diffPoint, setDiffPoint] = useState('');

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      // 1. ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 💡 修正：sessionをセットする前に、先にDBから avatar_seed を取得する
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_seed')
          .eq('id', user.id)
          .single();
        
        // 💡 取得し終わってから、アバターとセッションを「同時に」セットする
        setAvatarSeed(profile?.avatar_seed || user.id);
        setSession({ user });
      } else {
        setSession(null);
      }
    };

    // 💡 トレンドを取得する関数を追加
    const fetchTrendingTags = async () => {
      const { data, error } = await supabase
        .from('trending_tags_cache')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (data) {
        // rank_1 〜 rank_5 の中で、空でないものだけを配列にする
        const tags = [data.rank_1, data.rank_2, data.rank_3, data.rank_4, data.rank_5].filter(Boolean);
        setTrendingTags(tags);
      }
    };
    
    checkUser();
    fetchTopics(0, true);
    fetchTrendingTags();
  }, [isArchiveMode]);

  const handleToggleMode = (mode: boolean) => {
    if (isArchiveMode === mode) return; // 同じモードなら何もしない
    
    setTopics([]);      // 💡 1. 既存のリストを空にする（これで「LIVE状態」が消える）
    setPage(0);         // 💡 2. ページをリセット
    setIsArchiveMode(mode); // 💡 3. モードを切り替える（これでuseEffectが走る）
  };

  const fetchTopics = async (pageIndex: number = 0, isInitial: boolean = true, customQuery?: string) => {
    setIsSearching(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
  
    let query = supabase
      .from('topics')
      .select(`
        *,
        profiles(username),
        topic_time_controls(id, action_type, user_id),
        corrections!topic_id(
          *,
          profiles(username),
          likes(user_id)
        )
      `)
      .eq('is_current', true)
      .eq('status', isArchiveMode ? 'archived' : 'active');
  
    // 💡 ここを修正：customQuery が渡されたらそれを使い、なければ searchQuery を使う
    const targetQuery = customQuery !== undefined ? customQuery : searchQuery;
    const trimmedSearch = targetQuery.trim();

    if (trimmedSearch !== '') {
      const words = trimmedSearch.split(/[\s　]+/);
      words.forEach(word => {
        // search_tags.cs.{word} を追加することで、タグの中に完全一致する単語があるか探します
        query = query.or(
          `genre.ilike.%${word}%,ai_text.ilike.%${word}%,focus_point.ilike.%${word}%,search_tags.cs.{${word}}`
        );
      });
    }
  
    // 並び順と実行
    query = isArchiveMode 
      ? query.order('revival_count', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });
  
    const { data, error } = await query.range(from, to);
  
    if (error) {
      console.error("Fetch error:", error.message);
    } else if (data) {
      setHasMore(data.length === PAGE_SIZE);
      const processedData = data.map((topic: any) => processTopicData(topic));
      setTopics(prev => isInitial ? processedData : [...prev, ...processedData]);
      setPage(pageIndex);
    }
    setIsSearching(false);
  };

  const processTopicData = (topic: any) => {
    const sortedCorrections = (topic.corrections || []).sort((a: any, b: any) => {
      const aLikes = a.likes?.length || 0;
      const bLikes = b.likes?.length || 0;
      if (bLikes !== aLikes) return bLikes - aLikes;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return { ...topic, bestCorrection: sortedCorrections[0] || null };
  };

  const handleNavigateGen = async (index: number, currentTopic: any, direction: 'prev' | 'next') => {
    let targetId;
    if (direction === 'prev') {
      if (!currentTopic.parent_id) return;
      targetId = currentTopic.parent_id;
    } else {
      const { data, error } = await supabase.from('topics').select('id').eq('parent_id', currentTopic.id).single();
      if (error || !data) return;
      targetId = data.id;
    }

    const { data: targetTopic } = await supabase
      .from('topics')
      .select(`*, profiles(username), topic_time_controls(id, action_type, user_id), corrections(*, profiles(username), likes(user_id))`)
      .eq('id', targetId)
      .single();

    if (targetTopic) {
      setTopics(prev => {
        const newTopics = [...prev];
        newTopics[index] = processTopicData(targetTopic);
        return newTopics;
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    setTopics([]);
    fetchTopics(0, true);
  };

  const loadMore = () => fetchTopics(page + 1, false);

  const generateTopic = async () => {
    if (!genre) return;
    setIsGenerating(true);
    setAiText("AIが内容を精査中...");
    setDuplicateTopics([]); 
    setShowDiffInput(false);
  
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre }),
      });
      
      const data = await res.json(); // ここで一旦JSONを受け取る
  
      // 💡 修正ポイント：通信自体が失敗（401, 500等）した場合のハンドリング
      if (!res.ok) {
        // サーバーが返した error または message を表示し、aiTextを戻す
        const errorMessage = data.error || data.message || "生成に失敗しました";
        toast.error(errorMessage);
        setAiText("「AIに下書きを作成させる」を押すと、ここに草稿が表示されます。");
        setIsGenerating(false);
        return;
      }
  
      // AIの判定ロジック（is_valid: false）の場合
      if (!data.is_valid) {
        toast.error(`投稿できません: ${data.reason}`);
        setAiText("地域に関係のない内容は投稿できません。");
        setIsGenerating(false);
        return;
      }
  
      // 成功時
      setConfirmedGenre(genre);
      setAiText(data.ai_text);
      setExtractedData(data);
  
      // ...（重複チェックのロジックはそのまま）...
      const { data: existing } = await supabase
        .from('topics')
        .select('*')
        .eq('is_current', true)
        .overlaps('search_tags', data.search_tags) 
        .limit(10);

      if (existing && existing.length > 0) {
        const filtered = existing.filter(t => {
          const existingTags = Array.isArray(t.search_tags) ? t.search_tags : [];
          const newTags = Array.isArray(data.search_tags) ? data.search_tags : [];
          const commonCount = existingTags.filter((tag: string) => newTags.includes(tag)).length;
          return commonCount >= 2;
        });
        setDuplicateTopics(filtered.slice(0, 3));
      }
  
    } catch (e: any) {
      // 💡 修正ポイント：ネットワーク遮断などの致命的なエラー時
      toast.error("通信エラーが発生しました。ログイン状態を確認してください。");
      setAiText("エラーにより生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('投稿にはログインが必要です');
    if (!confirmedGenre || !extractedData) return;
  
    // 💡 1. 【赤】かなり似ている（タグ2つ以上 ＋ 核心も一致）を探す
    const strongMatch = duplicateTopics.find(t => {
      // 💡 部分一致(.includes)を削除し、完全一致(===)のみにする
      return t.focus_point === extractedData.focus_point; 
    });
  
    // 💡 赤の対応：差別化入力必須
    if (strongMatch && !showDiffInput) {
      toast(
        <span>
          「{strongMatch.genre}」ですでに「{strongMatch.focus_point}」の視点で似た投稿があります。
          <br /><br />
          既存のお題と何が決定的に違うのかを入力してください。
        </span>, 
        {
          icon: 'ℹ️',
          duration: 6000, // 💡 6000ミリ秒（6秒）表示させて、ゆっくり読ませる
        }
      );
      setShowDiffInput(true);
      return;
    }
  
    // 💡 差別化入力のバリデーション
    if (showDiffInput && diffPoint.trim().length < 10) {
      return toast("既存のお題との違いを、10文字以上で入力してください。", {
        icon: 'ℹ️',
      });
    }
  
    // 💡 2. 【黄】緩い重複の確認（強烈な一致はないが、タグ2つ以上一致がある場合）
    if (!strongMatch && duplicateTopics.length > 0) {
      const proceed = window.confirm("似たタグのお題がすでにありますが、新しい視点として新規投稿しますか？");
      if (!proceed) return;
    }
  
    setIsSubmittingDraft(true);
  
    // 💡 5. 差別化ポイントを本文の冒頭に合体
    const finalAiText = showDiffInput 
      ? `【独自視点: ${diffPoint}】\n\n${aiText}`
      : aiText;
  
      const { error } = await supabase
      .from('topics')
      .insert([{ 
        genre: confirmedGenre,
        ai_text: finalAiText, 
        user_id: user.id,
        search_tags: extractedData.search_tags,
        focus_point: extractedData.focus_point,
        // 💡 以下の4行を明示的に追加して、検索条件に一致させる
        is_current: true,
        status: 'active',
        version: 1,
        carry_over_count: 0
      }]);
  
    if (!error) {
      toast.success('投稿しました！');
      setGenre('');
      setAiText('「AIに下書きを作成させる」を押すと、ここに草稿が表示されます。');
      setExtractedData(null);
      setDuplicateTopics([]);
      setDiffPoint('');
      setShowDiffInput(false);
      setActiveTab('search');
      fetchTopics(0, true);
    } else {
      toast.error("投稿エラー: " + error.message);
    }
    setIsSubmittingDraft(false);
  };

  // --- 以降、各種ハンドラ（Correction, Delete, Like等）は既存のものを維持 ---
  const handleSaveCorrection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!correctionText || !editingTopicId || !user) return;
    setIsSubmittingCorrection(true);
    const { error } = await supabase
      .from('corrections')
      .insert([{
        topic_id: editingTopicId,
        user_id: user.id,
        correction_text: correctionText,
      }]);

    if (!error) {
      toast.success('訂正案が投稿されました！');
      setEditingTopicId(null);
      setCorrectionText('');
      fetchTopics(0, true);
    }
    setIsSubmittingCorrection(false);
  };

  // 💡 修正：引数に targetUserId と topicId を追加
  const handleLike = async (correctionId: string, targetUserId: string, topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('ログインが必要です');
    const myId = user.id;

    // ==========================================
    // 1. 楽観的UI
    // ==========================================
    setTopics(prevTopics => prevTopics.map(topic => {
      if (topic.bestCorrection?.id === correctionId) {
        const currentLikes = topic.bestCorrection.likes || [];
        const alreadyLiked = currentLikes.some((l: any) => l.user_id === myId);
        const newLikes = alreadyLiked 
          ? currentLikes.filter((l: any) => l.user_id !== myId)
          : [...currentLikes, { user_id: myId }];
        return { ...topic, bestCorrection: { ...topic.bestCorrection, likes: newLikes } };
      }
      return topic;
    }));

    // ==========================================
    // 2. DBの裏側での処理
    // ==========================================
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', myId)
      .eq('correction_id', correctionId)
      .single();

    let dbError = null;

    if (existing) {
      const { error } = await supabase.from('likes').delete().eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabase.from('likes').insert([{ user_id: myId, correction_id: correctionId }]);
      dbError = error;
    }

    if (dbError) {
      console.error("いいねのDB保存エラー:", dbError);
      toast.error(`エラーが発生しました: ${dbError.message}\n（画面を再読み込みします）`);
      window.location.reload(); 
    }
  };

  const handleGenerateNextGen = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser(); // 💡 セッション確認
    if (!user) return toast.error('ログインが必要です');
    
    // UIを「生成中」に切り替える
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, is_generating: true } : t));

    try {
      const response = await fetch('/api/generate-next-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 💡 修正ポイント: userId は送らなくて良くなったので削除
        body: JSON.stringify({ topicId }) 
      });

      const data = await response.json();

      if (!response.ok) {
        // 💡 修正ポイント: [object Object] を防ぐため、エラーメッセージを具体的に取り出す
        throw new Error(data.error || data.message || 'サーバーエラーが発生しました');
      }

      // 成功時
      toast.success(data.message);
      fetchTopics(0, true); 

    } catch (error: any) {
      // 💡 修正ポイント: ここでエラー内容を表示
      toast.error("更新に失敗しました: " + error.message);
      
      // 失敗したら「生成中」の状態を解除する
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, is_generating: false } : t));
    }
  };

  // 💡 追加：シェア機能のハンドラ
  // 💡 修正：シェア機能のハンドラ（PCとスマホで挙動を分ける）
  const handleShare = async (topic: any) => {
    const shareUrl = `${window.location.origin}/topic/local/${topic.id}`;
    const shareText = `【Genquiry】「${topic.genre}」について、地元民の知恵で検証中！\n#Genquiry`;

    // スマホ・タブレットからのアクセスかどうかを判定
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // 📱 スマホ等の場合：ネイティブのシェアシートを開く（LINEやXが候補に出る）
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
      // 💻 PCの場合：OSのシェア画面は出さず、直接 X (Twitter) の投稿画面を開く
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    }
  };

  const handleVoteRevival = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser(); // 💡 最新セッション確認
    if (!user) return toast.error('復活させるにはログインが必要です');

    // 💡 ワンクッション確認を入れる
    const proceed = window.confirm('この探求をLIVEモードに復活させますか？\n（※3日間の寿命から再スタートします）');
    if (!proceed) return;
  
    const { data, error } = await supabase.rpc('vote_for_revival', {
      target_topic_id: topicId
    });
  
    if (error) {
      // 💡 DB側で RAISE EXCEPTION したメッセージ（「すでに支持済みです」など）を表示
      toast.error(error.message); 
      return;
    }
  
    // 💡 data.revived は常に true で返ってくる設計にしたので、分岐は不要
    toast.success('🎉 探求がLIVEモードに復活しました！');
    handleToggleMode(false);
  };

  const handleTrendClick = (tag: string) => {
    setSearchQuery(tag); // 検索窓に文字を入れる
    setSubmittedQuery(tag); // 「〇〇の検索結果」の表示を更新する
    fetchTopics(0, true, tag); // 💡 直接タグの文字を渡して検索を実行！
  };

  return (
    <main className="w-full flex flex-col p-4 md:p-8 lg:p-12 font-sans bg-[#F9FAFB] min-h-screen text-gray-800 relative">
      {/* --- ヘッダー部分は省略せずそのまま維持 --- */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Genquiry
          {/* 💡 BetaからLocalへ変更：背景色と丸みをつけてバッジ風に */}
          <span className="bg-emerald-600 text-white text-sm font-bold px-2 py-0.5 rounded-md tracking-normal">
            Local
          </span>
          </h1>
          <p className="text-gray-500 text-xs font-medium mt-1">質問箱形式で育つ新たな知識プラットフォーム</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 💡 【新規】ランキングボタン */}
          <Link 
            href="/leaderboard" 
            // 💡 修正：丸い背景や枠線をすべて削除し、ホバー時だけ少し暗くなるシンプルな設定に
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            title="ランキングを見る"
          >
            {/* 💡 修正：色をゴールドからダークグレーに変更し、少し線を太く(stroke-2)する */}
            <TrophyIcon className="w-6 h-6 stroke-2" />
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3"> {/* 💡 gapを3に調整 */}
            {/* 🔔 通知ベルコンポーネント (NotificationBell.tsx) */}
            <NotificationBell userId={session.user.id} />
            {/* 👤 アバター */}
            <Link href={`/profile/${session.user.id}`} className="w-10 h-10 rounded-full border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
                <img 
                  // 💡 修正：session.user.id から avatarSeed に変更
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                  alt="Profile" 
                  className="w-full h-full bg-emerald-50" 
                />
            </Link>
          </div>
          ) : (
            <Link href="/login" className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition">ログインして参加</Link>
          )}
        </div>
      </header>
      <div className="flex-grow">
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('search')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'search' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>🔍 記事を探す・検証する</button>
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>📝 下書きを作成</button>
        </div>

        {activeTab === 'search' && (
          <div className="animate-fade-in space-y-6 w-full block">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" placeholder="キーワードで検索" className="flex-grow p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-100 text-sm shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" disabled={isSearching} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition">検索</button>
            </form>

            {/* 💡 ここにトレンドタグを挿入！ */}
            {trendingTags.length > 0 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-[11px] font-black text-gray-400 flex-shrink-0 tracking-widest">
                  TRENDING
                </span>
                {trendingTags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleTrendClick(tag)}
                    className="flex-shrink-0 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition shadow-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* 💡 【新規】件数表示とアーカイブスイッチの横並び行 */}
            <div className="flex justify-between items-center px-1">
              {/* 左側：件数表示 */}
              <div className="text-sm font-bold text-gray-500">
                {submittedQuery.trim() !== '' 
                  ? `「${submittedQuery}」の検索結果： ${topics.length} 件` 
                  : `新着記事： ${topics.length} 件`}
              </div>

              {/* 右側：アーカイブ切り替えトグル */}
              <div className="flex items-center gap-2 bg-gray-200/50 p-1 rounded-full border border-gray-200 shadow-inner">
                <button
                  onClick={() => handleToggleMode(false)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    !isArchiveMode 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  LIVE
                </button>
                <button
                  onClick={() => handleToggleMode(true)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    isArchiveMode 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ARCHIVE
                </button>
              </div>
            </div>

            {/* 💡 変更：ローディング中、0件、一覧表示 を綺麗に分岐させる */}
            {isSearching && topics.length === 0 ? (
              // 🔄 ① 検索中のローディングアニメーション
              <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-gray-400">
                  {isArchiveMode ? "アーカイブを読み込み中..." : "記事を探しています..."}
                </p>
              </div>
            ) : !isSearching && topics.length === 0 ? (
              // 📭 ② 検索結果が0件だった時の表示
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-3 opacity-50">🔎</div>
                <p className="text-sm font-bold text-gray-400">該当する記事が見つかりませんでした。</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSubmittedQuery('');
                    fetchTopics(0, true, '');
                  }}
                  className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition"
                >
                  検索条件をクリア
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((topic, index) => {
                    const best = topic.bestCorrection;
                    const correctionCount = topic.corrections?.length || 0;
                    const isPastGen = !topic.is_current;
                    const msLeft = new Date(topic.expires_at).getTime() - new Date().getTime();
                    const isExpired = msLeft <= 0;
                    const canInteract = topic.is_current && !isExpired;
                    const needsGeneration = topic.is_current && isExpired;
                    let timeLeftText = isPastGen ? 'アーカイブ' : isExpired ? '期限切れ' : msLeft < 1000 * 60 * 60 * 24 ? `残り: ${Math.floor(msLeft / (1000 * 60 * 60))} 時間` : `残り: ${Math.floor(msLeft / (1000 * 60 * 60 * 24))} 日`;
                    const myControl = topic.topic_time_controls?.find((c: any) => c.user_id === session?.user?.id);

                    const isMyCorrection = best && session?.user?.id === best.user_id;
                    const isMyLike = best?.likes?.some((l: any) => l.user_id === session?.user?.id);

                    const msFromCreation = new Date().getTime() - new Date(topic.created_at).getTime();
                    const isProtected = msFromCreation < 1000 * 60 * 60 * 24 * 3;

                    return (
                      <article key={topic.id} className={`
                        bg-white rounded-2xl p-6 shadow-sm border transition flex flex-col relative h-full
                        ${isArchiveMode 
                          ? 'border-gray-300 bg-gray-50/50 sepia-[0.1]' 
                          : 'border-gray-200 hover:shadow-md'          
                        }
                      `}>
                        <div className="flex items-start justify-between mb-4 w-full gap-3">
                          
                          <div className="flex flex-col gap-2.5 flex-grow">
                            
                            {/* 上段：GENバッジと残り時間 */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-emerald-50 rounded-lg shadow-sm border border-emerald-100 overflow-hidden flex-shrink-0">
                                <button onClick={() => handleNavigateGen(index, topic, 'prev')} disabled={topic.version <= 1} className="px-2 py-1.5 text-[10px] text-emerald-700 hover:bg-emerald-200 disabled:opacity-30 transition font-black">◀</button>
                                <span className="px-2 py-1.5 text-[10px] font-black text-emerald-800 uppercase border-x border-emerald-100 bg-emerald-100">GEN {topic.version}</span>
                                <button onClick={() => handleNavigateGen(index, topic, 'next')} disabled={topic.is_current} className="px-2 py-1.5 text-[10px] text-emerald-700 hover:bg-emerald-200 disabled:opacity-30 transition font-black">▶</button>
                              </div>
                              
                              <p className={`text-[9px] font-bold flex items-center gap-1 ${
                                isArchiveMode ? 'text-gray-400' : (msLeft < 1000 * 60 * 60 * 24 ? 'text-red-500 animate-pulse' : 'text-amber-600')
                              }`}>
                                {isArchiveMode ? '📚 アーカイブ' : `⌛ ${timeLeftText}`}
                              </p>
                            </div>

                            {/* 中段：タグ（グレーでスッキリ） */}
                            {topic.search_tags && topic.search_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {topic.search_tags.map((tag: string, i: number) => (
                                  <span 
                                    key={i} 
                                    className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-md border border-gray-200 uppercase tracking-tighter"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* 下段：タイトル（背景をなくし、左にアクセントライン） */}
                            <div className="w-fit mt-1 pl-3 border-l-4 border-emerald-500">
                              <p className="text-sm md:text-base font-black text-gray-900 leading-relaxed break-words line-clamp-1">
                                {topic.genre}
                              </p>
                            </div>
                          </div>

                          {/* 右端：シェアボタン */}
                          <div className="flex-shrink-0 ml-2 mt-1">
                            <button 
                              onClick={() => handleShare(topic)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                              title="シェアする"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4 flex-grow flex flex-col">
                          
                          {/* 💡 変更：AI原案を「付箋風」にしてドラフト感を演出 */}
                          <div className={`p-4 rounded-xl border ${isArchiveMode ? 'bg-gray-100 border-gray-200' : 'bg-amber-50/50 border-amber-100/50'}`}>
                            <p className="text-gray-400 font-bold mb-1.5 text-[10px] uppercase tracking-tighter flex items-center gap-1">
                              <span>🤖</span> AI原案 
                              {topic.focus_point && (
                                <span className="text-gray-500 ml-1">
                                  / 「<span className="font-black underline decoration-gray-300 underline-offset-2">{topic.focus_point}</span>」に注目
                                </span>
                              )}
                            </p>
                            <p className="leading-relaxed text-base text-gray-800 font-medium line-clamp-3">
                              {topic.ai_text}
                            </p>
                          </div>

                          {/* ベストアンサー枠 */}
                          <div className="mt-auto pt-2">
                            {best ? (
                              <div className={`p-4 rounded-xl border flex flex-col h-[96px] ${isPastGen ? 'bg-gray-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                {/* 💡 変更：人間の回答を text-sm にし、font-bold で力強く */}
                                <p className="text-gray-900 font-bold leading-relaxed text-sm line-clamp-2 flex-grow">
                                  {best.correction_text}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <button 
                                    onClick={() => canInteract && !isMyCorrection && handleLike(best.id, best.user_id, topic.id)}
                                    disabled={!canInteract || isMyCorrection} 
                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition shadow-sm flex items-center gap-1 ${
                                      (!canInteract || isMyCorrection)
                                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50'
                                    }`}
                                  >
                                    <span>{isMyLike ? '✅' : '👍'}</span>
                                    {best.likes?.length || 0}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 text-center flex flex-col justify-center h-[96px]">
                                {/* 💡 変更：検証待ちも少しメリハリをつける */}
                                <p className="text-[11px] text-gray-400 font-bold">検証待ち</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* フッターアクションエリア */}
                        <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                          <Link href={`/topic/local/${topic.id}`} className={`w-full block text-center text-xs font-bold py-3 rounded-lg border transition ${correctionCount > 1 ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {correctionCount > 1 ? `👉 他の訂正（${correctionCount - 1}件）を見る` : '🔍 詳細・全回答を見る'}
                          </Link>

                          {canInteract && session?.user && (
                            <button onClick={() => setEditingTopicId(topic.id)} className="w-full text-xs font-bold py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm">
                              ✏️ 自分の訂正を投稿
                            </button>
                          )}

                          {!isArchiveMode ? (
                            needsGeneration && (
                              <div className="space-y-2 pt-2">
                                <p className="text-[10px] text-red-500 font-bold text-center bg-red-50 py-1.5 rounded">
                                  {topic.carry_over_count >= 1 ? '⚠️ 1回引き継ぎ済み。今回十分な検証がない場合、削除されます。' : '⏳ 期限切れ：次世代への更新が必要です'}
                                </p>
                                <button 
                                  onClick={() => handleGenerateNextGen(topic.id)}
                                  disabled={topic.is_generating}
                                  className="w-full text-xs font-bold py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm flex justify-center items-center gap-2"
                                >
                                  {topic.is_generating ? '🔄 生成中...' : '🌟 次の世代（GEN）に更新する'}
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="space-y-3 pt-2">
                              <button 
                                onClick={() => handleVoteRevival(topic.id)}
                                className="w-full text-xs font-black py-4 rounded-xl transition shadow-md flex justify-center items-center gap-2 transform active:scale-95 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:opacity-90"
                              >
                                🔄 ワンクリックでLIVEに復活させる
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
                {hasMore && topics.length > 0 && <div className="mt-12 flex justify-center pb-8"><button onClick={loadMore} className="bg-white border border-gray-200 text-gray-600 font-bold px-12 py-4 rounded-xl shadow-sm">もっと見る</button></div>}
              </>
            )}
          </div>
        )}

        {/* 💡 タブ「create」部分：重複トピックの提示UIを追加 */}
        {activeTab === 'create' && (
          <div className="animate-fade-in space-y-6 w-full block">
            {session?.user ? (
              <section className="w-full bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-200">
                  <h2 className="font-bold text-sm text-gray-700 mt-2">テーマ・地域を指定</h2>
                  
                  {/* 💡 ボタンと入力欄を上揃え(items-start)で並べる */}
                  <div className="flex gap-2 items-start w-full md:w-auto">
                    
                    {/* 💡 入力欄とカウンターを縦並び(flex-col)でまとめる箱 */}
                    <div className="flex flex-col flex-grow md:w-72 focus-within:md:w-[28rem] transition-all duration-300 ease-in-out">
                    <textarea 
                        maxLength={200}
                        rows={2} // 最初から2行分の高さを確保
                        className="text-sm rounded-lg bg-white border border-gray-300 px-4 py-2.5 w-full outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors shadow-sm resize-none" 
                        placeholder="例：鎌倉の裏道（改行もできます）" 
                        value={genre} 
                        onChange={(e) => setGenre(e.target.value)} 
                      />
                      {/* 💡 カウンターをここへ。mt-1 で入力欄と少し隙間を空ける */}
                      <p className={`text-[10px] text-right mt-1 font-medium ${genre.length >= 190 ? 'text-red-500' : 'text-gray-400'}`}>
                        {genre.length}/200
                      </p>
                    </div>

                    <button onClick={generateTopic} disabled={isGenerating} className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0">
                      {isGenerating ? "作成中..." : "AI下書き作成"}
                    </button>
                    
                  </div>
                </div>

                {/* 💡 重複トピックが見つかった場合の警告・誘導表示 */}
                {duplicateTopics.length > 0 && (
                  <div className="px-8 pt-6">
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                      <h3 className="text-amber-800 font-black text-sm mb-3 flex items-center gap-2">
                        💡 似たお題がすでに見つかりました
                      </h3>
                      <div className="space-y-3 mb-4">
                      {duplicateTopics.map(t => (
                        <Link 
                          href={`/topic/local/${t.id}`} 
                          key={t.id} 
                          target="_blank" // 💡 これを追加：新しいタブで開く
                          rel="noopener noreferrer" // セキュリティのためのセット
                          className="block bg-white p-3 rounded-xl border border-amber-100 hover:shadow-sm transition group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600 transition">
                              {t.genre} (GEN {t.version})
                            </span>
                            <span className="text-[9px] text-gray-400">別タブで確認 ↗</span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                            「{t.focus_point}」に注目したお題
                          </p>
                          {/* 💡 アーカイブの場合のみ、復活を促す文言を出す */}
                          {t.status === 'archived' && (
                            <p className="text-[9px] text-amber-600 font-bold mt-1">
                              ※このお題はアーカイブされています。リンク先で「支持」して復活させることができます。
                            </p>
                          )}
                        </Link>
                      ))}
                      </div>
                      <p className="text-[10px] text-amber-600 font-bold italic">※ 新しく作るより、既存のお題に参加したほうが知識が集まりやすくなります！</p>
                    </div>
                  </div>
                )}

                <div className="p-8 border-b border-gray-100">
                {showDiffInput && (
                  <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl animate-fade-in shadow-sm">
                    <label className="block text-xs font-black text-blue-800 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span>🚀</span> 既存のお題との決定的な違い
                    </label>
                    <textarea
                      maxLength={150} // 💡 150文字制限を追加
                      className="w-full p-4 rounded-xl border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="例：既存のはランチのみですが、これは深夜営業店に特化しています。"
                      rows={3}
                      value={diffPoint}
                      onChange={(e) => setDiffPoint(e.target.value)}
                    />
                    {/* 💡 カウンターを追加 */}
                    <p className={`text-[10px] text-right mt-2 font-bold ${diffPoint.length >= 140 ? 'text-red-500' : 'text-blue-600'}`}>
                      {diffPoint.length}/150
                    </p>
                  </div>
                )}
                  <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 min-h-[140px] text-gray-700 text-sm italic">{aiText}</div>
                </div>
                
                <div className="p-8 bg-gray-50">
                  <button 
                    onClick={handleSaveDraft} 
                    disabled={isSubmittingDraft || isGenerating || !confirmedGenre || !extractedData} 
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-sm disabled:bg-gray-300 transition"
                  >
                    {isSubmittingDraft ? "保存中..." : "検証待ち記事として投稿する"}
                  </button>
                </div>
              </section>
            ) : (
              <section className="w-full bg-white shadow-sm rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-5xl mb-6">📝</div>
                <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">新しい記事を作成するには</h2>
                <Link href="/login" className="bg-emerald-600 text-white font-bold px-10 py-4 rounded-xl shadow-md transition">ログインして作成を始める</Link>
              </section>
            )}
          </div>
        )}
      </div>

      {/* 💡 【新規追加】サイトフッターエリア */}
      <Footer />

      {/* 編集モーダルはそのまま維持 */}
      {editingTopicId && (
        <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-gray-900">地元民として訂正案を出す</h2>

            <div className="flex justify-end mb-[-12px]">
              <button 
                onClick={() => {
                  // 現在編集しようとしているトピックのデータを取得
                  const targetTopic = topics.find(t => t.id === editingTopicId);
                  if (targetTopic) {
                    setCorrectionText(targetTopic.ai_text); // AIのテキストをセット
                  }
                }}
                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                AIの草稿をセットする
              </button>
            </div>

            <textarea 
              maxLength={1000} // 💡 1000文字制限を追加
              className="w-full h-40 p-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100" 
              placeholder="具体的な事実を訂正してください。" 
              value={correctionText} 
              onChange={(e) => setCorrectionText(e.target.value)}
            ></textarea>

            {/* 💡 訂正文のカウンター */}
            <p className={`text-[10px] text-right mt-1 font-bold ${correctionText.length >= 950 ? 'text-red-500' : 'text-gray-400'}`}>
              {correctionText.length}/1000
            </p>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => setEditingTopicId(null)} className="bg-gray-100 text-gray-600 font-bold py-4 rounded-xl">キャンセル</button>
              <button onClick={handleSaveCorrection} disabled={isSubmittingCorrection} className="bg-emerald-600 text-white font-bold py-4 rounded-xl disabled:bg-gray-300">投稿する</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
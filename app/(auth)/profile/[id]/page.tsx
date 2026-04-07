'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const supabase = createClient();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const [avatarSeed, setAvatarSeed] = useState('');
  
  const [totalLikes, setTotalLikes] = useState(0);
  const [trustScore, setTrustScore] = useState(0);

  // 💡 追加：活動履歴のステートとタブ
  const [myTopics, setMyTopics] = useState<any[]>([]);
  const [myCorrections, setMyCorrections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'topics' | 'corrections'>('topics');

  // 💡 追加：ページネーション用のステートと定数
  const PAGE_SIZE = 10;
  const [topicsPage, setTopicsPage] = useState(0);
  const [hasMoreTopics, setHasMoreTopics] = useState(true);
  const [correctionsPage, setCorrectionsPage] = useState(0);
  const [hasMoreCorrections, setHasMoreCorrections] = useState(true);

  const isOwnProfile = session?.user?.id === id;

  useEffect(() => {
    getInitialData();
  }, [id]);

  const getInitialData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) console.warn('User not logged in or session expired');
      setSession(user ? { user } : null);

      // 1. プロフィール情報の取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
        setTotalLikes(profileData.total_likes_received || 0);
        setTrustScore(profileData.trust_score ?? 0);
        setAvatarSeed(profileData.avatar_seed || id);
      }

      // 💡 修正：自分のプロフィールの時だけ、履歴の1ページ目（0番）を取得する
      if (user && user.id === id) {
        await fetchMyTopics(0, true);
        await fetchMyCorrections(0, true);
      }

    } catch (error: any) {
      console.error('Profile fetch error details:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
  };

  // 💡 追加：お題を10件ずつ取得する関数
  const fetchMyTopics = async (pageIndex: number, isInitial: boolean = true) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (data) {
      setHasMoreTopics(data.length === PAGE_SIZE);
      setMyTopics(prev => isInitial ? data : [...prev, ...data]);
      setTopicsPage(pageIndex);
    }
  };

  // 💡 追加：訂正案を10件ずつ取得する関数
  const fetchMyCorrections = async (pageIndex: number, isInitial: boolean = true) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('corrections')
      .select('*, topics!topic_id(*)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      setHasMoreCorrections(data.length === PAGE_SIZE);
      setMyCorrections(prev => isInitial ? data : [...prev, ...data]);
      setCorrectionsPage(pageIndex);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== id) {
        toast('セッションが切れました。再度ログインしてください。', {
          icon: 'ℹ️', // または 💡 など
        });
        return;
      }

      const updates = {
        id: user.id,
        username,
        bio,
        avatar_seed: avatarSeed,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      toast.success('プロフィールを更新しました！');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('更新エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-bold text-gray-400 animate-pulse">読み込み中...</div>;
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-12 px-4 font-sans text-gray-800 flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow w-full">
        <div className="flex justify-between items-center mb-8">
          <Link href="/home" className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-2">
            ← トップページに戻る
          </Link>
          {isOwnProfile && (
            <button 
              onClick={handleSignOut}
              className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 uppercase"
            >
              ログアウト
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-8 flex justify-between items-end">
              <div className="relative group"> {/* 💡 relativeに変更 */}
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md">
                  {/* 💡 修正：avatarSeed を使って画像を表示 */}
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full bg-emerald-50" 
                  />
                </div>
                
                {/* 💡 追加：編集モードの時だけ表示されるシャッフルボタン */}
                {isEditing && (
                  <button
                    onClick={handleRandomizeAvatar}
                    className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition transform hover:scale-110 border-2 border-white"
                    title="アイコンをシャッフル"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}
              </div>
              
              {isOwnProfile && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mb-2 bg-gray-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg hover:bg-gray-800 transition"
                >
                  プロフィールを編集
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {username || '名無しの編集者'}
                    {isOwnProfile && <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-1 rounded-md">YOU</span>}
                  </h1>
                  <p className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="text-emerald-500">●</span> 
                    {/* 💡 スコアに応じた称号システム */}
                    {trustScore >= 100 ? 'Legendary Contributor' : 
                     trustScore >= 25 ? 'Local Expert' : 
                     trustScore >= 5 ? 'Verified Member' : 
                     'New Contributor'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">獲得いいね数</p>
                    <p className="text-2xl font-black text-emerald-700">{totalLikes}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">信頼スコア</p>
                    {/* 💡 0未満ならオレンジ色、それ以上なら通常色 */}
                    <p className={`text-2xl font-black ${trustScore < 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {trustScore} <span className="text-xs font-bold text-gray-400">Pt</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-7 rounded-2xl border border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">自己紹介</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {bio || (isOwnProfile 
                      ? '自己紹介が未入力です。編集ボタンからあなたの得意な地域などを書いてみましょう！'
                      : 'このユーザーは自己紹介をまだ記載していません。')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">プロフィール設定</h2>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 px-1">ユーザーネーム</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-300 transition-all text-sm font-medium"
                    placeholder="例：鎌倉マニアの佐藤"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 px-1">自己紹介 / Local Bio</label>
                  <textarea
                    className="w-full h-40 p-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-300 transition-all text-sm leading-relaxed font-medium"
                    placeholder="得意な地域やジャンルを教えてください。"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    // 💡 修正：ただ画面を戻すだけでなく、元のデータをDBから再取得してリセットする
                    onClick={async () => {
                      setIsEditing(false);
                      await getInitialData(); // ← これを追加！
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={updateProfile}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition shadow-lg disabled:bg-gray-300"
                  >
                    {loading ? '保存中...' : '変更を保存する'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 💡 追加：活動履歴（アクティビティ）セクション */}
        {!isEditing && (
          <div className="animate-fade-in mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                活動履歴 
                {!isOwnProfile && <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">🔒 Private</span>}
              </h2>
            </div>
            
            {isOwnProfile ? (
              <>
                {/* 自分の時だけ表示するタブ */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl shadow-inner">
                  <button 
                    onClick={() => setActiveTab('topics')} 
                    className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === 'topics' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    📝 作成したお題
                  </button>
                  <button 
                    onClick={() => setActiveTab('corrections')} 
                    className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === 'corrections' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🔍 投稿した検証
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTab === 'topics' && (
                    myTopics.length > 0 ? (
                      <>
                        {myTopics.map(topic => (
                          <Link href={`/topic/local/${topic.id}`} key={topic.id} className="block bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{topic.genre}</span>
                                {/* 💡 修正：文字を消し、色だけで現役(緑)かアーカイブ(灰)かを表現 */}
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${topic.is_current ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                  GEN {topic.version}
                                </span>
                              </div>
                              <span className="text-[14px] text-gray-300 group-hover:text-emerald-500 transition">→</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{topic.ai_text}</p>
                            <div className="flex justify-between items-center mt-4">
                              <p className="text-[10px] text-gray-400 font-bold">{new Date(topic.created_at).toLocaleDateString()}</p>
                            </div>
                          </Link>
                        ))}
                        
                        {/* さらに読み込むボタン (お題用) */}
                        {hasMoreTopics && (
                          <div className="pt-4 pb-2 flex justify-center">
                            <button 
                              onClick={() => fetchMyTopics(topicsPage + 1, false)}
                              className="bg-white border border-gray-200 text-gray-600 font-bold px-10 py-3 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                            >
                              さらに読み込む
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-sm text-gray-400 font-bold">まだ作成したお題はありません 📝</p>
                      </div>
                    )
                  )}

                  {activeTab === 'corrections' && (
                    myCorrections.length > 0 ? (
                      <>
                        {myCorrections.map(correction => (
                          <Link href={`/topic/local/${correction.topic_id}`} key={correction.id} className="block bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 px-2 py-0.5 rounded text-[9px] font-black text-emerald-700 uppercase flex items-center gap-1">
                                  👍 LIKES {correction.likes?.length || 0}
                                </span>
                                {correction.topics && (
                                  <span className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">
                                    in {correction.topics.genre}
                                  </span>
                                )}
                              </div>
                              <span className="text-[14px] text-gray-300 group-hover:text-emerald-500 transition">→</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3">
                              <p className="text-xs text-gray-900 leading-relaxed italic">
                                "{correction.correction_text}"
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold">{new Date(correction.created_at).toLocaleDateString()}</p>
                          </Link>
                        ))}

                        {/* さらに読み込むボタン (訂正案用) */}
                        {hasMoreCorrections && (
                          <div className="pt-4 pb-2 flex justify-center">
                            <button 
                              onClick={() => fetchMyCorrections(correctionsPage + 1, false)}
                              className="bg-white border border-gray-200 text-gray-600 font-bold px-10 py-3 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                            >
                              さらに読み込む
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-sm text-gray-400 font-bold">まだ投稿した検証はありません 🔍</p>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              /* 他人が見た時のプレースホルダー */
              <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 animate-pulse">
                <div className="text-3xl mb-4 opacity-50">🔒</div>
                <p className="text-sm text-gray-400 font-black uppercase tracking-widest">
                  Activities are private
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                  活動履歴は本人のみに公開されています。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
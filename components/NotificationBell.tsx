'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/solid'

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();
    
    // リアルタイムで通知を受け取る設定
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        () => fetchNotifications()
      )
      .subscribe();

    // 枠外クリックで閉じる処理
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => { 
      supabase.removeChannel(channel);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  // 💡 修正：引数 closeMenu を追加し、ボタンを押しただけならメニューを閉じないようにする
  const markAsRead = async (id: string, closeMenu: boolean = true) => {
    // 楽観的UI更新（APIレスポンスを待たずに画面上の見た目を先に既読にする）
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (closeMenu) setIsOpen(false);
  };

  // 💡 追加：すべて既読にする関数
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    // 画面上をすべて既読状態にする
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    // DBを更新
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        // 💡 修正：丸い背景や枠線を削除
        className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative flex items-center justify-center"
      >
        {/* 💡 修正：シンプルな線画のベルに変更 */}
        <BellIcon className="w-6 h-6 stroke-2" />
        
        {/* 未読カウントバッジ（背景がなくなった分、位置を少し内側に微調整） */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm border-2 border-[#F9FAFB]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-[100] overflow-hidden">
          {/* 💡 修正：ヘッダーに「すべて既読にする」ボタンを配置 */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="font-black text-sm text-gray-800">お知らせ</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 transition bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
              >
                すべて既読にする
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium">新しい通知はありません</div>
            ) : (
              notifications.map(n => (
                // 💡 修正：Linkタグの中にbuttonを入れるとHTMLエラーになるため、親をdivに変更
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-gray-50 text-xs transition ${!n.is_read ? 'bg-emerald-50/40' : 'bg-white'}`}
                >
                  <Link 
                    href={n.link_url || '#'} 
                    onClick={() => markAsRead(n.id, true)} 
                    className="block mb-2 group"
                  >
                    <p className={`leading-relaxed group-hover:text-emerald-600 transition ${!n.is_read ? 'text-emerald-900 font-bold' : 'text-gray-700'}`}>
                      {n.content}
                    </p>
                  </Link>
                  
                  {/* 💡 追加：日付と個別既読ボタンの横並びコンテナ */}
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id, false)}
                        className="text-[9px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded transition"
                      >
                        既読にする
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
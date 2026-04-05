'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // getUser を使うことで、トークンが有効かサーバー側で厳格にチェックします
        const { error } = await supabase.auth.getUser();
        
        // リフレッシュトークンエラーやセッション切れを検知した場合
        if (error) {
          console.warn('Auth session error:', error.message);
          // signOut を呼ぶことで、ブラウザに残った壊れたトークンを掃除します
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error('Unexpected auth error:', e);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F9FAFB] p-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl shadow-sm" />)}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
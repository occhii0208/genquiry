import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

// サーバー側でデータを取得するためのSupabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 💡 ここで動的にSEO（メタデータ）を生成します
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {

  const resolvedParams = await params;
  const topicId = resolvedParams.id;

  const { data: topic } = await supabase
    .from('topics')
    .select('genre, ai_text')
    .eq('id', topicId)
    .single();

  if (!topic) {
    return { title: '記事が見つかりません | Genquiry' };
  }

  // AIの草稿の冒頭を、SNSのカードに表示する説明文にします
  const descriptionText = topic.ai_text.length > 80 
    ? topic.ai_text.substring(0, 80) + '...' 
    : topic.ai_text;

  return {
    title: `${topic.genre} | Genquiry`,
    description: descriptionText,
    openGraph: {
      title: `${topic.genre} | Genquiry`,
      description: descriptionText,
      type: 'article',
      siteName: 'Genquiry',
    },
    twitter: {
      card: 'summary', // 大きな画像を設定する場合は 'summary_large_image'
      title: `${topic.genre} | Genquiry`,
      description: descriptionText,
    },
  };
}

// 実際の画面（page.tsx）をそのまま表示するためのラッパー
export default function TopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
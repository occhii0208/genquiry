import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 💡 修正ポイント：変数名の後ろに `: MetadataRoute.Sitemap` を追加して型を教える
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily', // ※型を指定したので `as const` は消してOKです
      priority: 1,
    },
  ];

  // Supabaseから現在公開されている最新トピックのIDをすべて取得
  const { data: topics } = await supabase
    .from('topics')
    .select('id, created_at')
    .eq('is_current', true);

  if (topics) {
    // 💡 こっちも `as const` は外してしまって大丈夫です（あっても問題ありません）
    const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
      url: `${baseUrl}/topic/${topic.id}`,
      lastModified: new Date(topic.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    
    routes.push(...topicRoutes);
  }

  return routes;
}
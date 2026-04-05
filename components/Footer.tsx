// components/Footer.tsx
import Link from 'next/link';
import AdBanner from './AdBanner';

export default function Footer() {
  return (
    <footer className="w-full mt-16 pt-8 border-t border-gray-200 pb-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        <AdBanner className="mb-12" />

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold text-gray-500 mb-8 w-full max-w-2xl">
          <Link href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition">運営者情報</Link>
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition">お問い合わせ</Link>
          {/* 💡 修正：target="_blank" と rel="noopener noreferrer" を追加 */}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition">利用規約</Link>
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition">プライバシーポリシー</Link>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 Genquiry Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
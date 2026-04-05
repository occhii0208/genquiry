// components/AdBanner.tsx

interface AdBannerProps {
    className?: string; // 外側から余白などを調整できるようにする
  }
  
  export default function AdBanner({ className = "" }: AdBannerProps) {
    return (
      // 💡 将来Google AdSenseのタグに差し替える時は、このdivの中身を書き換えます
      <div className={`w-full max-w-2xl mx-auto h-28 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-400 font-medium tracking-widest">ADVERTISEMENT</span>
      </div>
    );
  }
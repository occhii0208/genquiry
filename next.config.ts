import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 💡 ここに許可するIPアドレスを追加します
  allowedDevOrigins: ['10.155.97.40','172.16.12.5','10.231.230.140','172.16.12.18'],
};

export default nextConfig;
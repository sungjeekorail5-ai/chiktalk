import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true, // 👈 experimental 밖으로 꺼내줍니다.
  
  // (만약 experimental 안에 다른 설정이 없다면 experimental 블록 자체를 지워도 됩니다)
};

export default nextConfig;
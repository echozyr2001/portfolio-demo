import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  experimental: {
    mdxRs: true,
  },
  turbopack: {
    // 如果需要配置路径别名，可以在这里添加
    // resolveAlias: {
    //   '@': './src',
    // },
  },
};

export default nextConfig;

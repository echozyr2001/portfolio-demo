import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // Monaco Editor support and Node.js modules fallback
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        child_process: false,
        os: false,
        util: false,
        stream: false,
        buffer: false,
      };
    }
    
    return config;
  },
};

export default withPayload(nextConfig);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add webpack configuration to handle potential module issues
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
  },
};

export default nextConfig;

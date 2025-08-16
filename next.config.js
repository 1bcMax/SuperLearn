/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'demo_env_id',
    NEXT_PUBLIC_FLOW_ACCESS_NODE: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'http://localhost:8888',
    NEXT_PUBLIC_UAGENT_ENDPOINT: process.env.NEXT_PUBLIC_UAGENT_ENDPOINT || 'http://localhost:8000',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
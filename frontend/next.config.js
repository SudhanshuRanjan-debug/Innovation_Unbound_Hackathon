/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
};
module.exports = nextConfig;

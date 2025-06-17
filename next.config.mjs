/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during production builds  
    ignoreBuildErrors: true,
  },
  // Enable if you need to access environment variables at build time
  // experimental: {
  //   outputFileTracingIncludes: {
  //     '/**/*.env*': true,
  //   },
  // },
}

export default nextConfig 
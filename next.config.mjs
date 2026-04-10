/** @type {import('next').NextConfig} */
const nextConfig = {
  // Edge network gzip/brotli compression for fast global load times
  compress: true,
  // Strict mode required for highly concurrent enterprise React architectures  
  reactStrictMode: true,
  // Cache and CDN max optimization for global delivery
  generateEtags: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Experimental optimizers for caching across regions
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are stable in Next.js 16, no longer experimental
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      }
    ],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    JWT_SECRET: process.env.JWT_SECRET || 'cancha-ya-jwt-secret'
  }
};

export default nextConfig;
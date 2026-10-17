import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {hostname: 'res.cloudinary.com'},
      {hostname: 'api.cloudinary.com'},
      {hostname: 'lh3.googleusercontent.com'},
      {hostname: 'api.dicebear.com'},
      {hostname: 'images.unsplash.com'},
    ],
  },

  reactStrictMode: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;

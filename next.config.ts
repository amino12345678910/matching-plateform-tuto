import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {hostname: 'res.cloudinary.com'},
      {hostname: 'api.cloudinary.com'},
      {hostname: 'lh3.googleusercontent.com'},
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
``;

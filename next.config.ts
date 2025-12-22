import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'api.cloudinary.com', 'lh3.googleusercontent.com'],
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

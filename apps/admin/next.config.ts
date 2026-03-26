import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mspi/shared-types', '@mspi/ui'],
};

export default nextConfig;

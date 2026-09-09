import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/web-jms' : '',
  assetPrefix: isGitHubPages ? '/web-jms/' : '',
};

export default nextConfig;

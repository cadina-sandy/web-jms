import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isGitHubPages ? { output: 'export' as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/web-jms' : '',
  assetPrefix: isGitHubPages ? '/web-jms/' : '',
};

export default nextConfig;

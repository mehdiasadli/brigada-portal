import type { NextConfig } from 'next';
import createMdx from '@next/mdx';

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['ts', 'tsx', 'md', 'mdx', 'js', 'jsx'],
  experimental: {
    mdxRs: true,
  },
};

const withMDX = createMdx({});

export default withMDX(nextConfig);

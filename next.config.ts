import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/posts",
  distDir: process.argv.includes('build') ? 'out/posts' : '.next',
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

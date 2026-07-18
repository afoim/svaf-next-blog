import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/posts",
  distDir: "out/posts",
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),
  output: "export",
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@at-sim/parts", "@at-sim/vehicles"],
  reactStrictMode: true,
};

export default nextConfig;

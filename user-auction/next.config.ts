import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ["lh3.googleusercontent.com", "localhost", "auction-backend-production-2602.up.railway.app", "res.cloudinary.com"],
  },

};

export default nextConfig;


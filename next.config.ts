import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Listing photos uploaded to Cloud Storage for Firebase
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      // Google account avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;

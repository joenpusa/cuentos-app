import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname = '';

if (supabaseUrl) {
  try {
    supabaseHostname = new URL(supabaseUrl).hostname;
  } catch (e) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL:', e);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname ? [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ] : [],
  },
};

export default nextConfig;

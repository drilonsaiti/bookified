import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
            },
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_BLOB_BASE_URL || ''
            }
        ]
    }
};

export default nextConfig;

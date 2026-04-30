import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        }
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
            },
            {
                protocol: 'https',
                hostname: '6gcryt1tbzxyjqvk.public.blob.vercel-storage.com'
            }
        ]
    }
};

export default nextConfig;

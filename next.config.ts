import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Use the API base URL from environment or default to localhost:3005
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api';
    
    return [
      {
        source: '/api/notifications/:path*',
        destination: `${apiBaseUrl}/notifications/:path*`,
      },
    ];
  },
};

export default nextConfig;

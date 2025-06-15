const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Add default values for environment variables when not defined
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_WEBSOCKET_HOST: process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost',
    NEXT_PUBLIC_WEBSOCKET_PORT: process.env.NEXT_PUBLIC_WEBSOCKET_PORT || '6001',
    NEXT_PUBLIC_WEBSOCKET_SECURE: process.env.NEXT_PUBLIC_WEBSOCKET_SECURE || 'false',
  },
  // Add additional configuration as needed
  reactStrictMode: true,
  swcMinify: true,
  // Disable development overlays and indicators for presentations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
  },
  // Disable error overlay in development
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Configure CORS if needed
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
};

module.exports = withNextIntl(nextConfig);
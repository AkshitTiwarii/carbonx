/** @type {import('next').NextConfig} */
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  redirects: async () => [
    {
      source: "/carbon-calculator",
      destination: "/calculator",
      permanent: false,
    },
  ],
};

export default nextConfig;

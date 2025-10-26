/** @type {import('next').NextConfig} */
const shimPath = new URL('./emptyAsyncStorageShim.js', import.meta.url).pathname;
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Provide a shim for React Native async storage used by some SDKs so Next.js build doesn't fail
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": shimPath,
    };
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

import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";

// Refer to https://portal.thirdweb.com/typescript/v5/client for obtaining a client ID
const clientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_CLIENT_ID ||
  "your-client-id"; // Fallback to prevent null client

// Always create a client instance (keeps the exported `client` type stable)
export const client = createThirdwebClient({ clientId });

export function getThirdwebClient() {
  return client;
}

// Trading Configuration
export const TRADING_CONFIG = {
  SUPPORTED_CHAINS: [ethereum],
  DEFAULT_CHAIN: ethereum,
  CARBON_TOKEN_ADDRESS: "0x1234567890123456789012345678901234567890", // Replace with actual contract
  USDC_ADDRESS: "0xA0b86a33E6417c7a0670F219959E98Bb6C9e0ecC", // Ethereum USDC
  TRADING_FEE: 0.003, // 0.3%
  SLIPPAGE_TOLERANCE: 0.005 // 0.5%
};

// Market Data API endpoints
export const API_ENDPOINTS = {
  PRICE_FEED: "/api/trading/prices",
  ORDER_BOOK: "/api/trading/orderbook",
  TRADE_HISTORY: "/api/trading/history",
  USER_ORDERS: "/api/trading/orders",
  MARKET_STATS: "/api/trading/stats"
};

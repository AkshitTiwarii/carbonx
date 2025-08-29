// MetaMask Ethereum Provider Types
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

export interface MetaMaskError extends Error {
  code: number;
  data?: any;
}

export interface EthereumRpcError extends Error {
  code: number;
  data?: unknown;
}

export {};

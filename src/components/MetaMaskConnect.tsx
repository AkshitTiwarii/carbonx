"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MetaMaskSDK } from "@metamask/sdk";

interface MetaMaskState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  balance: string | null;
  error: string | null;
}

const MetaMaskConnect = () => {
  const [state, setState] = useState<MetaMaskState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null,
    error: null
  });

  const [sdk, setSdk] = useState<MetaMaskSDK | null>(null);

  // Initialize MetaMask SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "CarbonX - Carbon Credits Trading Platform",
            url: window.location.origin,
          },
          infuraAPIKey: "63af025bca554eebadbbec9f4d41d986",
          checkInstallationImmediately: false,
          preferDesktop: true,
        });

        setSdk(MMSDK);

        const ethereum = MMSDK.getProvider();

        // Listen for account changes
        ethereum?.on('accountsChanged', (...args: unknown[]) => {
          const accounts = args[0] as string[];
          if (accounts.length === 0) {
            // User disconnected
            setState(prev => ({
              ...prev,
              account: null,
              isConnected: false,
              balance: null
            }));
          } else {
            setState(prev => ({
              ...prev,
              account: accounts[0],
              isConnected: true
            }));
            // Fetch balance for new account
            fetchBalance(accounts[0]);
          }
        });

        // Listen for chain changes
        ethereum?.on('chainChanged', (...args: unknown[]) => {
          const chainId = args[0] as string;
          setState(prev => ({
            ...prev,
            chainId: chainId ?? null
          }));
        });

        // Check if already connected
        const accounts = await ethereum?.request({ method: 'eth_accounts' }) as string[] | undefined;
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          setState(prev => ({
            ...prev,
            account: accounts[0],
            isConnected: true
          }));
          fetchBalance(accounts[0]);
          
          // Get current chain
            const chainId = await ethereum?.request({ method: 'eth_chainId' }) as string;
            setState(prev => ({
              ...prev,
              chainId: chainId || null
            }));
        }

      } catch (error) {
        console.error("MetaMask SDK initialization failed", error);
        setState(prev => ({
          ...prev,
          error: "Failed to initialize MetaMask SDK"
        }));
      }
    };

    initSDK();
  }, []);

  // Fetch account balance
  const fetchBalance = useCallback(async (account: string) => {
    if (!sdk) return;
    
    try {
      const ethereum = sdk.getProvider();
      const balance = await ethereum?.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      }) as string | undefined;
      
      if (balance) {
        // Convert from wei to ETH
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setState(prev => ({
          ...prev,
          balance: balanceInEth
        }));
      }
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  }, [sdk]);

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!sdk) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        setState(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
          isConnecting: false
        }));
        
        // Fetch balance and chain info
        fetchBalance(accounts[0]);
        
        const ethereum = sdk.getProvider();
        const chainId = await ethereum?.request({ method: 'eth_chainId' }) as string | undefined;
        setState(prev => ({
          ...prev,
          chainId: chainId || null
        }));
      }
    } catch (error) {
      console.error("MetaMask connection failed", error);
      setState(prev => ({
        ...prev,
        error: "Connection failed. Please try again.",
        isConnecting: false
      }));
    }
  };

  // Disconnect from MetaMask
  const disconnect = async () => {
    if (!sdk) return;
    
    try {
      await sdk.terminate();
      setState({
        account: null,
        isConnected: false,
        isConnecting: false,
        chainId: null,
        balance: null,
        error: null
      });
    } catch (error) {
      console.error("Disconnect failed", error);
    }
  };

  // Switch to Ethereum mainnet
  const switchToEthereum = async () => {
    if (!sdk) return;
    
    try {
      const ethereum = sdk.getProvider();
      await ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      });
    } catch (error) {
      console.error("Chain switch failed", error);
      setState(prev => ({
        ...prev,
        error: "Failed to switch to Ethereum mainnet"
      }));
    }
  };

  // Get network name
  const getNetworkName = (chainId: string | null) => {
    if (!chainId) return "Unknown";
    
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0xa86a': 'Avalanche',
      '0x38': 'BSC',
      '0xa4b1': 'Arbitrum',
    };
    
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <h2 className="text-xl font-semibold text-zinc-100">MetaMask Wallet</h2>
      </div>
      
      {state.error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{state.error}</p>
        </div>
      )}

      {!state.isConnected ? (
        <div>
          <p className="text-zinc-400 text-sm mb-4">
            Connect your MetaMask wallet to start trading carbon credits
          </p>
          <button
            onClick={connectMetaMask}
            disabled={state.isConnecting}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isConnecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">Account</div>
            <div className="text-zinc-100 font-mono text-sm break-all">
              {state.account}
            </div>
          </div>

          {/* Balance */}
          {state.balance && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">Balance</div>
              <div className="text-zinc-100 font-semibold">
                {state.balance} ETH
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">Network</div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-100">{getNetworkName(state.chainId)}</span>
              {state.chainId !== '0x1' && (
                <button
                  onClick={switchToEthereum}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Switch to Ethereum
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchBalance(state.account!)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={disconnect}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>

          {/* Trading Link */}
          <div className="pt-4 border-t border-zinc-800">
            <a
              href="/trading"
              className="block w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all"
            >
              Start Trading Carbon Credits
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaMaskConnect;

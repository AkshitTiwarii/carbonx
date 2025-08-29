"use client";

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { ethereum } from 'thirdweb/chains';

interface MetaMaskState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isMetaMask: boolean;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  address: string;
}

export const useMetaMask = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  
  const [metaMaskState, setMetaMaskState] = useState<MetaMaskState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isMetaMask: false
  });

  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if MetaMask is available
  const isMetaMaskAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
  }, []);

  // Get ETH balance
  const getBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return null;
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      // Convert from wei to ETH
      return (parseInt(balance, 16) / 10**18).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, []);

  // Get token balances (ERC-20)
  const getTokenBalance = useCallback(async (tokenAddress: string, userAddress: string) => {
    if (!window.ethereum) return null;

    try {
      // ERC-20 balanceOf function selector
      const data = `0x70a08231${userAddress.slice(2).padStart(64, '0')}`;
      
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest']
      });

      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }, []);

  // Switch to Ethereum mainnet
  const switchToEthereum = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      });
      return true;
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://ethereum.publicnode.com'],
              blockExplorerUrls: ['https://etherscan.io']
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding chain:', addError);
          return false;
        }
      }
      console.error('Error switching chain:', error);
      return false;
    }
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (to: string, value: string, data?: string) => {
    if (!account?.address || !window.ethereum) return null;

    try {
      const txParams = {
        from: account.address,
        to,
        value: `0x${(parseFloat(value) * 10**18).toString(16)}`, // Convert ETH to wei
        data: data || '0x'
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }, [account]);

  // Sign message
  const signMessage = useCallback(async (message: string) => {
    if (!account?.address || !window.ethereum) return null;

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account.address]
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [account]);

  // Update state when account changes
  useEffect(() => {
    const updateMetaMaskState = async () => {
      if (account?.address && wallet) {
        setLoading(true);
        
        const balance = await getBalance(account.address);
        const chainId = await window.ethereum?.request({ method: 'eth_chainId' });

        setMetaMaskState({
          isConnected: true,
          address: account.address,
          balance,
          chainId: chainId ? parseInt(chainId, 16) : null,
          isMetaMask: isMetaMaskAvailable() || false
        });

        setLoading(false);
      } else {
        setMetaMaskState({
          isConnected: false,
          address: null,
          balance: null,
          chainId: null,
          isMetaMask: isMetaMaskAvailable() || false
        });
      }
    };

    updateMetaMaskState();
  }, [account, wallet, getBalance, isMetaMaskAvailable]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = () => {
      window.location.reload(); // Simple approach - reload page
    };

    const handleChainChanged = () => {
      window.location.reload(); // Simple approach - reload page
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    ...metaMaskState,
    tokenBalances,
    loading,
    isMetaMaskAvailable: isMetaMaskAvailable(),
    switchToEthereum,
    sendTransaction,
    signMessage,
    getTokenBalance,
    refreshBalance: () => account?.address && getBalance(account.address)
  };
};

// MetaMask Circuit Breaker Reset Utility
// This helps reset MetaMask when the circuit breaker is triggered

export interface MetaMaskError {
  code: number;
  message: string;
  data?: {
    cause?: {
      isBrokenCircuitError?: boolean;
      message?: string;
    };
  };
}

export async function resetMetaMaskConnection(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask not available');
    return false;
  }

  try {
    console.log('🔄 Resetting MetaMask connection...');

    // Step 1: Disconnect from all sites (if supported)
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      });
      console.log('✅ Revoked existing permissions');
    } catch (error) {
      console.log('ℹ️ Permission revocation not supported or failed');
    }

    // Step 2: Add/Switch to Hardhat network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
      console.log('✅ Switched to Hardhat network');
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Network doesn't exist, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            }],
          });
          console.log('✅ Added Hardhat network');
        } catch (addError) {
          console.error('❌ Failed to add network:', addError);
          return false;
        }
      } else {
        console.error('❌ Failed to switch network:', switchError);
        return false;
      }
    }

    // Step 3: Request fresh account connection
    await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log('✅ Reconnected accounts');

    // Step 4: Test connection with a simple call
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (chainId === '0x7a69' && accounts.length > 0) {
        console.log('🎉 MetaMask connection reset successful!');
        return true;
      } else {
        console.error('❌ Connection test failed after reset');
        return false;
      }
    } catch (testError) {
      console.error('❌ Connection test failed:', testError);
      return false;
    }

  } catch (error) {
    console.error('❌ Failed to reset MetaMask connection:', error);
    return false;
  }
}

export function isCircuitBreakerError(error: any): boolean {
  return (
    error?.data?.cause?.isBrokenCircuitError === true ||
    error?.message?.includes('circuit breaker is open') ||
    error?.message?.includes('Execution prevented because the circuit breaker is open')
  );
}

export async function waitForCircuitBreakerReset(
  maxWaitTime = 30000, // 30 seconds
  checkInterval = 2000  // 2 seconds
): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Try a simple call to test if circuit breaker is reset
      await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      console.log('✅ Circuit breaker appears to be reset');
      return true;
    } catch (error) {
      if (!isCircuitBreakerError(error)) {
        // Different error, circuit breaker might be reset
        return true;
      }
      
      console.log('⏳ Circuit breaker still active, waiting...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }
  
  console.log('⏰ Timeout waiting for circuit breaker reset');
  return false;
}

// Utility to show user-friendly error messages
export function getMetaMaskErrorMessage(error: any): string {
  if (isCircuitBreakerError(error)) {
    return `MetaMask circuit breaker is active. This happens when there are too many failed requests. 
    Please wait a moment and try again, or use the "Reset MetaMask Connection" button.`;
  }

  if (error?.code === 4001) {
    return 'Transaction was rejected by user.';
  }

  if (error?.code === -32603) {
    return 'Internal error in MetaMask. Try refreshing the page or restarting MetaMask.';
  }

  if (error?.message?.includes('network')) {
    return 'Network connection issue. Please check your connection to the Hardhat network.';
  }

  return error?.message || 'Unknown MetaMask error occurred.';
}

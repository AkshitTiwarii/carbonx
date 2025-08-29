"use client";

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  category: 'crypto' | 'carbon' | 'token';
  contractAddress?: string;
  chainId?: string;
  icon?: string;
  balance?: number;
  value?: number;
}

interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  assets: CryptoAsset[];
}

export default function CryptoPortfolio() {
  const account = useActiveAccount();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    totalChange24h: 0,
    assets: []
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'carbon'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch crypto market data
  const fetchCryptoData = useCallback(async (category: string = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/crypto/prices?category=${category}`);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.data);
        
        // Simulate portfolio balances (in real app, fetch from blockchain)
        const portfolioAssets = data.data.map((asset: CryptoAsset) => {
          const balance = Math.random() * 10; // Random balance for demo
          return {
            ...asset,
            balance,
            value: asset.price * balance
          };
        }).filter((asset: CryptoAsset) => asset.balance && asset.balance > 0.01);
        
        const totalValue = portfolioAssets.reduce((sum: number, asset: CryptoAsset) => sum + (asset.value || 0), 0);
        const totalChange24h = portfolioAssets.reduce((sum: number, asset: CryptoAsset) => {
          const changeValue = (asset.value || 0) * (asset.change24h / 100);
          return sum + changeValue;
        }, 0);
        
        setPortfolio({
          totalValue,
          totalChange24h: (totalChange24h / totalValue) * 100,
          assets: portfolioAssets
        });
      } else {
        setError('Failed to fetch crypto data');
      }
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchCryptoData(selectedCategory);
    const interval = setInterval(() => fetchCryptoData(selectedCategory), 30000);
    return () => clearInterval(interval);
  }, [selectedCategory, fetchCryptoData]);

  // Add custom token via MetaMask
  const addCustomToken = async () => {
    if (!account?.address) {
      alert('Please connect your wallet first');
      return;
    }

    const contractAddress = prompt('Enter token contract address:');
    if (!contractAddress) return;

    try {
      const response = await fetch('/api/crypto/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress,
          chainId: '0x1',
          userAddress: account.address
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Custom token added successfully!');
        fetchCryptoData(selectedCategory);
      } else {
        alert('Failed to add token: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding custom token:', error);
      alert('Failed to add custom token');
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Portfolio</h1>
            <p className="text-zinc-400">
              Track your crypto assets and carbon credits with real-time market data
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={addCustomToken}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Add Custom Token
            </button>
            <button
              onClick={() => fetchCryptoData(selectedCategory)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {account?.address && portfolio.assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-1">Total Portfolio Value</h3>
              <div className="text-2xl font-bold">{formatValue(portfolio.totalValue)}</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-1">24h Change</h3>
              <div className={`text-2xl font-bold ${
                portfolio.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolio.totalChange24h >= 0 ? '+' : ''}{portfolio.totalChange24h.toFixed(2)}%
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-1">Assets</h3>
              <div className="text-2xl font-bold">{portfolio.assets.length}</div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            All Assets
          </button>
          <button
            onClick={() => setSelectedCategory('crypto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'crypto'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Cryptocurrencies
          </button>
          <button
            onClick={() => setSelectedCategory('carbon')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'carbon'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Carbon Credits
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Assets Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.symbol} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{asset.icon}</span>
                    <div>
                      <h3 className="font-semibold">{asset.symbol}</h3>
                      <p className="text-xs text-zinc-400">{asset.name}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    asset.category === 'crypto' ? 'bg-blue-500/20 text-blue-400' :
                    asset.category === 'carbon' ? 'bg-green-500/20 text-green-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {asset.category}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Price:</span>
                    <span className="font-semibold">{formatPrice(asset.price)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">24h Change:</span>
                    <span className={`font-semibold ${
                      asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Market Cap:</span>
                    <span className="text-sm">{formatValue(asset.marketCap)}</span>
                  </div>

                  {asset.contractAddress && (
                    <div className="pt-2 border-t border-zinc-800">
                      <div className="text-xs text-zinc-500 break-all">
                        {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`/trading?symbol=${asset.symbol}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm text-center transition-colors"
                  >
                    Trade
                  </a>
                  {asset.contractAddress && asset.contractAddress !== '0x0000000000000000000000000000000000000000' && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(asset.contractAddress!);
                        alert('Contract address copied!');
                      }}
                      className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
                      title="Copy contract address"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && assets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-semibold mb-2">No assets found</h3>
            <p className="text-zinc-400 mb-4">Try selecting a different category or refresh the data</p>
            <button
              onClick={() => fetchCryptoData(selectedCategory)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

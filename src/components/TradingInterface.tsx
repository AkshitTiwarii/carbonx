"use client";

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useMetaMask } from '@/hooks/useMetaMask';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  category: 'crypto' | 'carbon' | 'token';
  contractAddress?: string;
  chainId?: string;
  icon?: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  total: number;
  timestamp: number;
  txHash?: string;
}

export default function TradingInterface() {
  const account = useActiveAccount();
  const { isConnected, balance, signMessage, sendTransaction } = useMetaMask();
  
  const [selectedAsset, setSelectedAsset] = useState('CCX');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[]; spread: number } | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Trading form state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch('/api/crypto/prices?category=all');
      const data = await response.json();
      if (data.success) {
        setMarketData(data.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, []);

  // Fetch order book
  const fetchOrderBook = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`/api/trading/orderbook?symbol=${symbol}`);
      const data = await response.json();
      if (data.success) {
        setOrderBook(data.orderBook);
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  }, []);

  // Fetch recent trades
  const fetchRecentTrades = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`/api/trading/history?symbol=${symbol}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setRecentTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  }, []);

  // Execute trade
  const executeTrade = async () => {
    if (!isConnected || !account?.address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!price || !quantity) {
      alert('Please enter price and quantity');
      return;
    }

    setOrderLoading(true);
    try {
      // Sign a message to verify ownership
      const message = `Trade order: ${side} ${quantity} ${selectedAsset} at ${price} USDC`;
      await signMessage(message);

      // Execute trade via API
      const response = await fetch('/api/trading/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedAsset,
          side,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          userAddress: account.address
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Trade executed! TX: ${result.trade.txHash}`);
        // Reset form
        setPrice('');
        setQuantity('');
        // Refresh data
        fetchRecentTrades(selectedAsset);
        fetchOrderBook(selectedAsset);
      } else {
        alert('Trade failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      alert('Trade execution failed');
    } finally {
      setOrderLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  useEffect(() => {
    fetchOrderBook(selectedAsset);
    fetchRecentTrades(selectedAsset);
  }, [selectedAsset, fetchOrderBook, fetchRecentTrades]);

  const selectedMarketData = marketData.find(asset => asset.symbol === selectedAsset);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Crypto & Carbon Trading</h1>
          <p className="text-zinc-400">Trade cryptocurrencies and verified carbon credits with real-time market data</p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {marketData.slice(0, 12).map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset.symbol)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAsset === asset.symbol
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{asset.icon}</span>
                  <div>
                    <h3 className="font-semibold">{asset.symbol}</h3>
                    <p className="text-xs text-zinc-500">{asset.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-2 py-1 rounded text-xs mb-1 ${
                    asset.category === 'crypto' ? 'bg-blue-500/20 text-blue-400' :
                    asset.category === 'carbon' ? 'bg-green-500/20 text-green-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {asset.category}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    asset.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold mb-1">
                {asset.price < 1 ? `$${asset.price.toFixed(4)}` : `$${asset.price.toFixed(2)}`}
              </div>
              <div className="text-xs text-zinc-400">
                Vol: ${(asset.volume24h / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-zinc-500">
                MCap: ${(asset.marketCap / 1000000).toFixed(1)}M
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Trade {selectedAsset}</h2>
              
              {!isConnected && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm">Connect your wallet to start trading</p>
                </div>
              )}

              {isConnected && (
                <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                  <div className="text-sm text-zinc-400">Wallet Balance</div>
                  <div className="text-lg font-semibold">{balance} ETH</div>
                </div>
              )}

              {/* Order Type */}
              <div className="mb-4">
                <div className="flex border border-zinc-700 rounded-lg p-1">
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                      orderType === 'limit'
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Limit Order
                  </button>
                  <button
                    onClick={() => setOrderType('market')}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                      orderType === 'market'
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Market Order
                  </button>
                </div>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="mb-4">
                <div className="flex border border-zinc-700 rounded-lg p-1">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                      side === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                      side === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Price Input */}
              {orderType === 'limit' && (
                <div className="mb-4">
                  <label className="block text-sm text-zinc-400 mb-1">Price (USDC)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    />
                    {selectedMarketData && (
                      <button
                        onClick={() => setPrice(selectedMarketData.price.toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        Market
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Total */}
              {price && quantity && (
                <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total:</span>
                    <span className="font-semibold">
                      ${(parseFloat(price || '0') * parseFloat(quantity || '0')).toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={executeTrade}
                disabled={!isConnected || orderLoading || !price || !quantity}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  side === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {orderLoading ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset}`}
              </button>
            </div>
          </div>

          {/* Order Book & Recent Trades */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Book */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Order Book</h3>
              {orderBook && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Asks (Sell Orders) */}
                  <div>
                    <h4 className="text-sm text-red-400 mb-2">Asks (Sell)</h4>
                    <div className="space-y-1">
                      {orderBook.asks.slice(0, 8).reverse().map((ask, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-red-400">${ask.price.toFixed(2)}</span>
                          <span className="text-zinc-400">{ask.quantity.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div>
                    <h4 className="text-sm text-green-400 mb-2">Bids (Buy)</h4>
                    <div className="space-y-1">
                      {orderBook.bids.slice(0, 8).map((bid, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-green-400">${bid.price.toFixed(2)}</span>
                          <span className="text-zinc-400">{bid.quantity.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {orderBook && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Spread:</span>
                    <span className="text-zinc-200">${orderBook.spread.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Trades */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center text-sm py-2 border-b border-zinc-800 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                      <span className="text-zinc-200">${trade.price.toFixed(2)}</span>
                      <span className="text-zinc-400">{trade.quantity.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

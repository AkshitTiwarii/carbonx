import { NextRequest, NextResponse } from 'next/server';

// Enhanced crypto market data interface
interface CryptoData {
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

// Major cryptocurrencies with real contract addresses
const CRYPTO_ASSETS: CryptoData[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2650.45,
    change24h: 3.2,
    volume24h: 15600000000,
    high24h: 2689.50,
    low24h: 2580.30,
    marketCap: 318700000000,
    category: 'crypto',
    contractAddress: '0x0000000000000000000000000000000000000000', // Native ETH
    chainId: '0x1',
    icon: '🔷'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.01,
    volume24h: 4200000000,
    high24h: 1.001,
    low24h: 0.999,
    marketCap: 34500000000,
    category: 'crypto',
    contractAddress: '0xA0b86a33E6417c7a0670F219959E98Bb6C9e0ecC',
    chainId: '0x1',
    icon: '💵'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    price: 64250.75,
    change24h: 1.8,
    volume24h: 890000000,
    high24h: 65100.00,
    low24h: 63200.50,
    marketCap: 9850000000,
    category: 'crypto',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chainId: '0x1',
    icon: '₿'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    price: 1.00,
    change24h: -0.02,
    volume24h: 28500000000,
    high24h: 1.002,
    low24h: 0.998,
    marketCap: 118900000000,
    category: 'crypto',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: '0x1',
    icon: '🏦'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    price: 8.45,
    change24h: 4.6,
    volume24h: 156000000,
    high24h: 8.89,
    low24h: 7.95,
    marketCap: 5070000000,
    category: 'crypto',
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chainId: '0x1',
    icon: '🦄'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    price: 14.67,
    change24h: 2.1,
    volume24h: 345000000,
    high24h: 15.20,
    low24h: 14.10,
    marketCap: 8890000000,
    category: 'crypto',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chainId: '0x1',
    icon: '🔗'
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    price: 95.30,
    change24h: 6.8,
    volume24h: 167000000,
    high24h: 98.50,
    low24h: 89.20,
    marketCap: 1430000000,
    category: 'crypto',
    contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    chainId: '0x1',
    icon: '👻'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.52,
    change24h: 1.3,
    volume24h: 234000000,
    high24h: 0.54,
    low24h: 0.49,
    marketCap: 5200000000,
    category: 'crypto',
    contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    chainId: '0x1',
    icon: '🟣'
  }
];

// Carbon credit tokens
const CARBON_ASSETS: CryptoData[] = [
  {
    symbol: 'CCX',
    name: 'Carbon Credit Exchange',
    price: 12.47,
    change24h: 2.45,
    volume24h: 1250000,
    high24h: 12.89,
    low24h: 11.95,
    marketCap: 45600000,
    category: 'carbon',
    contractAddress: '0x1234567890123456789012345678901234567890',
    chainId: '0x1',
    icon: '🌱'
  },
  {
    symbol: 'VCU',
    name: 'Verified Carbon Units',
    price: 8.87,
    change24h: -1.42,
    volume24h: 890000,
    high24h: 9.15,
    low24h: 8.75,
    marketCap: 32100000,
    category: 'carbon',
    contractAddress: '0x2345678901234567890123456789012345678901',
    chainId: '0x1',
    icon: '✅'
  },
  {
    symbol: 'REDD',
    name: 'REDD+ Credits',
    price: 15.58,
    change24h: 5.55,
    volume24h: 2100000,
    high24h: 16.20,
    low24h: 14.80,
    marketCap: 78900000,
    category: 'carbon',
    contractAddress: '0x3456789012345678901234567890123456789012',
    chainId: '0x1',
    icon: '🌳'
  },
  {
    symbol: 'GOLD',
    name: 'Gold Standard Credits',
    price: 22.37,
    change24h: 1.79,
    volume24h: 1890000,
    high24h: 22.85,
    low24h: 21.90,
    marketCap: 156700000,
    category: 'carbon',
    contractAddress: '0x4567890123456789012345678901234567890123',
    chainId: '0x1',
    icon: '🏆'
  }
];

// Simulate real-time price updates
function simulatePriceUpdate(asset: CryptoData): CryptoData {
  const volatility = asset.category === 'crypto' ? 0.02 : 0.01; // Crypto more volatile
  const priceChange = (Math.random() - 0.5) * volatility;
  const newPrice = asset.price * (1 + priceChange);
  
  return {
    ...asset,
    price: Math.max(0.01, newPrice),
    change24h: asset.change24h + (Math.random() - 0.5) * 2,
    volume24h: asset.volume24h * (1 + (Math.random() - 0.5) * 0.1),
    high24h: Math.max(asset.high24h, newPrice),
    low24h: Math.min(asset.low24h, newPrice)
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'crypto', 'carbon', or 'all'
    const symbols = searchParams.get('symbols')?.split(','); // Specific symbols
    
    let assets: CryptoData[] = [];
    
    // Filter by category
    switch (category) {
      case 'crypto':
        assets = CRYPTO_ASSETS;
        break;
      case 'carbon':
        assets = CARBON_ASSETS;
        break;
      default:
        assets = [...CRYPTO_ASSETS, ...CARBON_ASSETS];
    }
    
    // Filter by specific symbols if requested
    if (symbols && symbols.length > 0) {
      assets = assets.filter(asset => symbols.includes(asset.symbol));
    }
    
    // Simulate real-time price updates
    const updatedAssets = assets.map(simulatePriceUpdate);
    
    // Sort by market cap (descending)
    updatedAssets.sort((a, b) => b.marketCap - a.marketCap);
    
    return NextResponse.json({
      success: true,
      data: updatedAssets,
      timestamp: Date.now(),
      meta: {
        total: updatedAssets.length,
        categories: {
          crypto: updatedAssets.filter(a => a.category === 'crypto').length,
          carbon: updatedAssets.filter(a => a.category === 'carbon').length,
          token: updatedAssets.filter(a => a.category === 'token').length
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market data',
        data: []
      },
      { status: 500 }
    );
  }
}

// POST endpoint for adding custom tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, chainId, userAddress } = body;
    
    if (!contractAddress || !chainId || !userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Validate the contract address using Infura/MetaMask
    // 2. Fetch token metadata from the blockchain
    // 3. Get real-time price data from DEX APIs
    // 4. Store custom token in user's portfolio
    
    // Mock response for demonstration
    const customToken: CryptoData = {
      symbol: 'CUSTOM',
      name: 'Custom Token',
      price: 1.00,
      change24h: 0,
      volume24h: 0,
      high24h: 1.00,
      low24h: 1.00,
      marketCap: 1000000,
      category: 'token',
      contractAddress,
      chainId,
      icon: '🪙'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Custom token added successfully',
      token: customToken
    });
    
  } catch (error) {
    console.error('Error adding custom token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add custom token' },
      { status: 500 }
    );
  }
}

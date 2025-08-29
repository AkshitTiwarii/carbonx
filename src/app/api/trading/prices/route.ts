import { NextRequest, NextResponse } from 'next/server';

// Mock trading data - in production, this would connect to a real exchange API
interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
}

// Sample carbon credit market data
const MOCK_MARKET_DATA: MarketData[] = [
  {
    symbol: 'CCX',
    price: 12.45,
    change24h: 2.3,
    volume24h: 1250000,
    high24h: 12.89,
    low24h: 11.95,
    marketCap: 45600000
  },
  {
    symbol: 'VCU',
    price: 8.90,
    change24h: -1.2,
    volume24h: 890000,
    high24h: 9.15,
    low24h: 8.75,
    marketCap: 32100000
  },
  {
    symbol: 'REDD',
    price: 15.60,
    change24h: 5.7,
    volume24h: 2100000,
    high24h: 16.20,
    low24h: 14.80,
    marketCap: 78900000
  },
  {
    symbol: 'GOLD',
    price: 22.35,
    change24h: 1.8,
    volume24h: 1890000,
    high24h: 22.85,
    low24h: 21.90,
    marketCap: 156700000
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');

    // Add some random price movement to simulate live data
    const liveData = MOCK_MARKET_DATA.map(asset => ({
      ...asset,
      price: asset.price + (Math.random() - 0.5) * 0.1,
      change24h: asset.change24h + (Math.random() - 0.5) * 0.5
    }));

    if (symbol) {
      const asset = liveData.find(a => a.symbol.toLowerCase() === symbol.toLowerCase());
      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }
      return NextResponse.json(asset);
    }

    return NextResponse.json({
      data: liveData,
      timestamp: Date.now(),
      success: true
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

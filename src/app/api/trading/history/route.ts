import { NextRequest, NextResponse } from 'next/server';

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

// Mock recent trades
function generateRecentTrades(symbol: string, basePrice: number): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < 20; i++) {
    const price = basePrice + (Math.random() - 0.5) * 2;
    const quantity = Math.random() * 500 + 50;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const timestamp = now - (i * 60000); // 1 minute intervals

    trades.push({
      id: `trade_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: symbol.toUpperCase(),
      side,
      price: parseFloat(price.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(2)),
      total: parseFloat((price * quantity).toFixed(2)),
      timestamp,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') || 'CCX';
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Base prices for different assets
    const basePrices: { [key: string]: number } = {
      'CCX': 12.45,
      'VCU': 8.90,
      'REDD': 15.60,
      'GOLD': 22.35
    };

    const basePrice = basePrices[symbol.toUpperCase()] || 12.45;
    const trades = generateRecentTrades(symbol, basePrice).slice(0, limit);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      trades,
      count: trades.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, side, price, quantity, userAddress } = body;

    // Validate required fields
    if (!symbol || !side || !price || !quantity || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate the user's wallet signature
    // 2. Check their balance
    // 3. Execute the trade on-chain
    // 4. Update the order book
    // 5. Record the transaction

    const trade: Trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: symbol.toUpperCase(),
      side,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      total: parseFloat((price * quantity).toFixed(2)),
      timestamp: Date.now(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
    };

    return NextResponse.json({
      trade,
      message: 'Trade executed successfully',
      success: true
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    );
  }
}

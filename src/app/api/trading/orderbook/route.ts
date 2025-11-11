import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  lastUpdate: number;
}

// Generate realistic order book data
function generateOrderBook(basePrice: number): OrderBook {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  // Generate bids (buy orders) - prices below current price
  for (let i = 0; i < 15; i++) {
    const price = basePrice - (i + 1) * 0.05;
    const quantity = Math.random() * 1000 + 100;
    bids.push({
      price: parseFloat(price.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(2)),
      total: parseFloat((price * quantity).toFixed(2))
    });
  }

  // Generate asks (sell orders) - prices above current price
  for (let i = 0; i < 15; i++) {
    const price = basePrice + (i + 1) * 0.05;
    const quantity = Math.random() * 1000 + 100;
    asks.push({
      price: parseFloat(price.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(2)),
      total: parseFloat((price * quantity).toFixed(2))
    });
  }

  const spread = asks[0].price - bids[0].price;

  return {
    bids: bids.sort((a, b) => b.price - a.price), // Highest bids first
    asks: asks.sort((a, b) => a.price - b.price), // Lowest asks first
    spread: parseFloat(spread.toFixed(2)),
    lastUpdate: Date.now()
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') || 'CCX';

    // Base prices for different assets
    const basePrices: { [key: string]: number } = {
      'CCX': 12.45,
      'VCU': 8.90,
      'REDD': 15.60,
      'GOLD': 22.35
    };

    const basePrice = basePrices[symbol.toUpperCase()] || 12.45;
    const orderBook = generateOrderBook(basePrice);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      orderBook,
      success: true
    });
  } catch (error) {
    console.error('Error generating order book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order book data' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Remove trailing slash to prevent double slashes in URLs
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// Fallback badges data
const FALLBACK_BADGES = {
  success: true,
  data: {
    "eco_warrior": {
      id: "eco_warrior",
      name: "Eco Warrior",
      description: "Complete 10 sustainability actions",
      icon: "🌱",
      points_required: 500
    },
    "carbon_saver": {
      id: "carbon_saver",
      name: "Carbon Saver",
      description: "Offset 100 tons of CO2",
      icon: "🌍",
      points_required: 1000
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/rewards/badges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('Badges fetch timed out, using fallback');
        return NextResponse.json(FALLBACK_BADGES);
      }
      if (fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('fetch')) {
        console.warn('Cannot connect to backend for badges, using fallback');
        return NextResponse.json(FALLBACK_BADGES);
      }
      throw fetchError;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.warn('Invalid JSON response from badges endpoint, using fallback');
      return NextResponse.json(FALLBACK_BADGES);
    }

    if (!response.ok) {
      console.warn('Badges endpoint returned error, using fallback');
      return NextResponse.json(FALLBACK_BADGES);
    }

    // Ensure response has success field
    if (!data.success) {
      return NextResponse.json({
        success: true,
        badges: data.badges || data.data || FALLBACK_BADGES.data
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Badges fetch error:', error);
    // Return fallback data instead of error
    return NextResponse.json(FALLBACK_BADGES);
  }
}


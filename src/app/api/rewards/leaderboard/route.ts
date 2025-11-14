import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Remove trailing slash to prevent double slashes in URLs
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const region = searchParams.get('region') || null;

    const url = new URL(`${BACKEND_URL}/api/rewards/leaderboard`);
    url.searchParams.set('limit', limit.toString());
    if (region) {
      url.searchParams.set('region', region);
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(url.toString(), {
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
        return NextResponse.json(
          { success: false, error: 'Request timed out' },
          { status: 504 }
        );
      }
      if (fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('fetch')) {
        return NextResponse.json(
          { success: false, error: 'Cannot connect to backend service. Please ensure the backend is running.' },
          { status: 503 }
        );
      }
      throw fetchError;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from backend' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const errorDetail = data.detail || data;
      return NextResponse.json(
        { 
          success: false, 
          error: typeof errorDetail === 'string' ? errorDetail : (errorDetail.message || 'Failed to fetch leaderboard') 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


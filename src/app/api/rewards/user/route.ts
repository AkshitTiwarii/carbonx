import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely

// Remove trailing slash to prevent double slashes in URLs
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/rewards/user/${encodeURIComponent(user_id)}`, {
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
          error: typeof errorDetail === 'string' ? errorDetail : (errorDetail.message || 'Failed to fetch user rewards') 
        },
        { 
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          }
        }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('User rewards fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        }
      }
    );
  }
}


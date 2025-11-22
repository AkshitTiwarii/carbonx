import { NextRequest, NextResponse } from 'next/server';

// Remove trailing slash to prevent double slashes in URLs
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json(
        {
          success: false,
          status: 'validation_error',
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { user_id, action_type, amount = 1.0, metadata = {} } = body;

    // Validate required fields
    if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          status: 'validation_error',
          message: 'user_id is required and must be a non-empty string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    if (!action_type || typeof action_type !== 'string') {
      return NextResponse.json(
        {
          success: false,
          status: 'validation_error',
          message: 'action_type is required',
          code: 'INVALID_ACTION_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return NextResponse.json(
        {
          success: false,
          status: 'validation_error',
          message: 'amount must be a non-negative number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }

    // Call backend API with timeout
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      response = await fetch(`${BACKEND_URL}/api/rewards/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id.trim(),
          action_type,
          amount: typeof amount === 'number' ? amount : 1.0,
          metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            status: 'timeout_error',
            message: 'Request timed out. Please try again.',
            code: 'REQUEST_TIMEOUT'
          },
          { status: 504 }
        );
      }

      if (fetchError.message?.includes('fetch') || fetchError.message?.includes('ECONNREFUSED')) {
        return NextResponse.json(
          {
            success: false,
            status: 'connection_error',
            message: 'Cannot connect to backend service. Please try again later.',
            code: 'BACKEND_CONNECTION_ERROR'
          },
          { status: 503 }
        );
      }

      throw fetchError;
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      return NextResponse.json(
        {
          success: false,
          status: 'parse_error',
          message: 'Invalid response from backend service',
          code: 'INVALID_RESPONSE'
        },
        { status: 502 }
      );
    }

    // Handle backend errors
    if (!response.ok) {
      const errorDetail = data.detail || data;
      return NextResponse.json(
        {
          success: false,
          status: errorDetail.status || 'backend_error',
          message: typeof errorDetail === 'string' ? errorDetail : (errorDetail.message || 'Failed to update rewards'),
          code: errorDetail.code || `HTTP_${response.status}`
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Rewards update error:', error);
    
    // Log error for monitoring
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Send to logging service in production
    }

    return NextResponse.json(
      {
        success: false,
        status: 'internal_error',
        message: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}


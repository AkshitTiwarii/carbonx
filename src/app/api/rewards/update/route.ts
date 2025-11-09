import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action_type, amount = 1.0, metadata = {} } = body;

    if (!user_id || !action_type) {
      return NextResponse.json(
        { success: false, error: 'user_id and action_type are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/rewards/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        action_type,
        amount,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || 'Failed to update rewards' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Rewards update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


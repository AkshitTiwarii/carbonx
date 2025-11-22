import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'not-set';
  const stripped = backendUrl.replace(/\/$/, '');
  
  return NextResponse.json({
    original: backendUrl,
    stripped: stripped,
    hasTrailingSlash: backendUrl.endsWith('/'),
    testUrl: `${stripped}/api/rewards/user/test`,
  });
}

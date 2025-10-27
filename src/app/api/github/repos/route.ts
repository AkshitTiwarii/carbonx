import { NextResponse } from 'next/server';

// Proxy to fetch recent repos for the profile. Uses optional GITHUB_TOKEN.
export async function GET(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const url = new URL(request.url);
    // allow query passthrough: sort, per_page etc.
    const qs = url.searchParams.toString();
    const apiUrl = `https://api.github.com/users/AkshitTiwarii/repos${qs ? `?${qs}` : ''}`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(apiUrl, { headers });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 });
  }
}

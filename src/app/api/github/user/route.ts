import { NextResponse } from 'next/server';

// Server-side proxy to GitHub user endpoint.
// Optionally uses GITHUB_TOKEN from environment for authenticated requests.
export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch('https://api.github.com/users/AkshitTiwarii', {
      headers,
    });

    const text = await res.text();
    const status = res.status;

    return new NextResponse(text, { status, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch GitHub user' }, { status: 500 });
  }
}

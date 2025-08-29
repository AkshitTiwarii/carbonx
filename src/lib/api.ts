const ENV_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
export const API_BASE = ENV_BASE;

function withTimeout(ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function normalize(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const t = withTimeout();
  try {
    const res = await fetch(normalize(path), { cache: "no-store", signal: t.signal });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    const reason = err?.name === "AbortError" ? "timeout" : err?.message || String(err);
    throw new Error(`GET ${path} failed (${reason}). Base: ${API_BASE}`);
  } finally {
    t.clear();
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const t = withTimeout();
  try {
    const res = await fetch(normalize(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: t.signal,
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    const reason = err?.name === "AbortError" ? "timeout" : err?.message || String(err);
    throw new Error(`POST ${path} failed (${reason}). Base: ${API_BASE}`);
  } finally {
    t.clear();
  }
}

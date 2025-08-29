// Server-only helper to call Thirdweb Engine Transactions API
// Env vars:
// - THIRDWEB_SECRET_KEY (required)
// - THIRDWEB_SERVER_WALLET (required unless provided in payload)
// - THIRDWEB_ENGINE_URL (optional; defaults to https://api.thirdweb.com/v1/transactions)

export type ContractCall = {
  type: "contractCall";
  contractAddress: string;
  method: string; // e.g., "function mintTo(address to, uint256 amount)"
  params: (string | number)[];
};

export type EngineTxPayload = {
  chainId: string | number;
  from?: string; // server wallet address
  transactions: ContractCall[];
};

const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || "https://api.thirdweb.com/v1/transactions";

export async function submitEngineTransactions(payload: EngineTxPayload) {
  const secret = process.env.THIRDWEB_SECRET_KEY;
  if (!secret) {
    throw new Error("THIRDWEB_SECRET_KEY is missing");
  }

  if (!payload.from) {
    const from = process.env.THIRDWEB_SERVER_WALLET;
    if (!from) throw new Error("THIRDWEB_SERVER_WALLET is missing");
    payload.from = from;
  }

  const res = await fetch(ENGINE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": secret,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof (data as any)?.error === "string" ? (data as any).error : JSON.stringify(data);
    throw new Error(`Engine error ${res.status}: ${msg}`);
  }
  return data;
}

export async function getEngineTransaction(id: string) {
  const secret = process.env.THIRDWEB_SECRET_KEY;
  if (!secret) {
    throw new Error("THIRDWEB_SECRET_KEY is missing");
  }

  const url = `${ENGINE_URL.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": secret,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof (data as any)?.error === "string" ? (data as any).error : JSON.stringify(data);
    throw new Error(`Engine error ${res.status}: ${msg}`);
  }
  return data;
}

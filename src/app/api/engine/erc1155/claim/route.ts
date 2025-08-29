import { NextRequest } from "next/server";
import { submitEngineTransactions } from "@/lib/engine";

// POST /api/engine/erc1155/claim
// Body: { chainId: string|number, contractAddress: string, to?: string, tokenId?: string|number, quantity?: string|number, from?: string, method?: string, params?: (string|number)[] }
// Returns: { id: string, status: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chainId, contractAddress, to, tokenId, quantity, from, method, params } = body || {};

    if (!chainId || !contractAddress) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: chainId, contractAddress" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let callMethod = method as string | undefined;
    let callParams = params as (string | number)[] | undefined;

    if (!callMethod) {
      // Default to a common ERC1155 mint signature if method not provided
      if (!to || tokenId === undefined || quantity === undefined) {
        return new Response(
          JSON.stringify({ error: "Missing required fields for default method: to, tokenId, quantity" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      callMethod = "function mintTo(address to, uint256 tokenId, uint256 quantity)";
      callParams = [to, String(tokenId), String(quantity)];
    }

    const tx = {
      type: "contractCall" as const,
      contractAddress,
      method: callMethod,
      params: callParams || [],
    };

    const result = await submitEngineTransactions({
      chainId,
      from,
      transactions: [tx],
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

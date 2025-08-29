import { NextRequest, NextResponse } from "next/server";
import { submitEngineTransactions, type EngineTxPayload } from "@/lib/engine";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<EngineTxPayload> & {
      to?: string;
      amount?: string | number;
      contractAddress?: string;
      method?: string;
      params?: (string | number)[];
    };

    // Allow shorthand payload: { chainId, to, amount, contractAddress }
    let payload: EngineTxPayload;
    if (body.transactions && body.chainId) {
      payload = body as EngineTxPayload;
    } else {
      const { chainId, to, amount, contractAddress } = body;
      if (!chainId || !to || !amount || !contractAddress) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      payload = {
        chainId,
        transactions: [
          {
            type: "contractCall",
            contractAddress,
            method: "function mintTo(address to, uint256 amount)",
            params: [to, amount],
          },
        ],
      };
    }

    const out = await submitEngineTransactions(payload);
    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Engine error" }, { status: 500 });
  }
}

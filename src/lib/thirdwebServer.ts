import "server-only";
import { createThirdwebClient } from "thirdweb";

// Server-side thirdweb client using a secret key (never expose to the browser)
// Set THIRDWEB_SECRET_KEY in your local .env (no NEXT_PUBLIC prefix)
const secretKey = process.env.THIRDWEB_SECRET_KEY;

export const serverClient = secretKey
  ? createThirdwebClient({ secretKey })
  : (null as any);

export function getServerThirdwebClient() {
  if (!secretKey) {
    throw new Error(
      "THIRDWEB_SECRET_KEY is not set. Add it to your .env (server only)."
    );
  }
  return serverClient;
}

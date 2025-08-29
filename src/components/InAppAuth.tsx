"use client";

import { useMemo, useState } from "react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { preAuthenticate, hasStoredPasskey } from "thirdweb/wallets/in-app";
import { getThirdwebClient } from "@/app/client";
import { mainnet, polygon, sepolia, base, baseSepolia, optimism, arbitrum } from "thirdweb/chains";

type Strategy =
  | "google" | "apple" | "facebook" | "discord" | "github" | "twitch" | "x" | "telegram" | "line" | "coinbase"
  | "email" | "phone" | "passkey" | "guest" | "wallet" | "backend" | "jwt" | "auth_endpoint";

const CHAINS = [mainnet, polygon, base, optimism, arbitrum, sepolia, baseSepolia];

export default function InAppAuth() {
  const [status, setStatus] = useState<string>("");
  const [address, setAddress] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<Strategy>("google");
  const [mode, setMode] = useState<"EOA" | "EIP7702" | "EIP4337">("EOA");
  const [sponsorGas, setSponsorGas] = useState<boolean>(true);
  const [chainKey, setChainKey] = useState<string>(sepolia.id.toString());
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [jwt, setJwt] = useState("");
  const [backendSecret, setBackendSecret] = useState("");
  const [authPayload, setAuthPayload] = useState("");
  const [appName, setAppName] = useState("CarbonX");
  const [iconUrl, setIconUrl] = useState("");
  const [hideKeyExport, setHideKeyExport] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);

  const selectedChain = useMemo(() => CHAINS.find((c) => String(c.id) === chainKey) ?? sepolia, [chainKey]);

  async function doPreAuth() {
    try {
      const client = getThirdwebClient();
      if (!client) throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID env");
      if (strategy === "email") {
        if (!email) throw new Error("Enter email");
        await preAuthenticate({ client, strategy: "email", email });
        setStatus("Sent code to email");
      } else if (strategy === "phone") {
        if (!phone) throw new Error("Enter phone number");
        await preAuthenticate({ client, strategy: "phone", phoneNumber: phone });
        setStatus("Sent code to phone");
      }
    } catch (e: any) {
      setStatus(e?.message || "Pre-auth failed");
    }
  }

  async function connect() {
    setStatus("Connecting...");
    setAddress(null);
    setShowToken(null);
    try {
      const client = getThirdwebClient();
      if (!client) throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID env");

      // Configure wallet creation options
      const creation: any = {
        metadata: appName || iconUrl ? { name: appName || undefined, icon: iconUrl || undefined } : undefined,
        hidePrivateKeyExport: hideKeyExport,
      };
      if (mode === "EIP7702") {
        creation.executionMode = { mode: "EIP7702", sponsorGas };
      } else if (mode === "EIP4337") {
        creation.executionMode = { mode: "EIP4337", smartAccount: { chain: selectedChain, sponsorGas } };
      }

      const wallet = inAppWallet(creation);

      // Build connect options per strategy
      const baseOpts: any = { client };
      if (mode !== "EOA") {
        // Chain is set via executionMode.smartAccount for 4337; for others we can pass optional chain param
        if (mode === "EIP7702") baseOpts.chain = selectedChain;
      } else {
        baseOpts.chain = selectedChain;
      }

      let account;
      switch (strategy) {
        case "google":
        case "apple":
        case "facebook":
        case "discord":
        case "github":
        case "twitch":
        case "x":
        case "telegram":
        case "line":
        case "coinbase":
          account = await wallet.connect({ ...baseOpts, strategy });
          break;
        case "email":
          if (!email) throw new Error("Enter email");
          if (!verificationCode) throw new Error("Enter verification code");
          account = await wallet.connect({ ...baseOpts, strategy: "email", email, verificationCode });
          break;
        case "phone":
          if (!phone) throw new Error("Enter phone number");
          if (!verificationCode) throw new Error("Enter verification code");
          account = await wallet.connect({ ...baseOpts, strategy: "phone", phoneNumber: phone, verificationCode });
          break;
        case "passkey": {
          const has = await hasStoredPasskey(client);
          account = await wallet.connect({ ...baseOpts, strategy: "passkey", type: has ? "sign-in" : "sign-up" });
          break;
        }
        case "guest":
          account = await wallet.connect({ ...baseOpts, strategy: "guest" });
          break;
        case "wallet": {
          // Example: SIWE via Rabby
          const rabby = createWallet("io.rabby");
          account = await wallet.connect({ ...baseOpts, strategy: "wallet", wallet: rabby });
          break;
        }
        case "backend":
          if (!backendSecret) throw new Error("Enter backend walletSecret");
          account = await wallet.connect({ ...baseOpts, strategy: "backend", walletSecret: backendSecret });
          break;
        case "jwt":
          if (!jwt) throw new Error("Enter JWT");
          account = await wallet.connect({ ...baseOpts, strategy: "jwt", jwt });
          break;
        case "auth_endpoint":
          if (!authPayload) throw new Error("Enter auth payload");
          account = await wallet.connect({ ...baseOpts, strategy: "auth_endpoint", payload: authPayload });
          break;
        default:
          throw new Error("Unsupported strategy");
      }

      setAddress(account.address);
      setStatus("Connected");

      // Get auth token if available
      try {
        const token = await wallet.getAuthToken();
        if (token) setShowToken(token);
      } catch {}
    } catch (err: any) {
      setStatus(err?.message || "Failed to connect");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Strategy and smart account config */}
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          Strategy
          <select className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" value={strategy} onChange={(e) => setStrategy(e.target.value as Strategy)}>
            <optgroup label="Social">
              <option>google</option><option>apple</option><option>facebook</option><option>discord</option><option>github</option><option>twitch</option><option>x</option><option>telegram</option><option>line</option><option>coinbase</option>
            </optgroup>
            <optgroup label="Email/Phone/Passkey">
              <option>email</option><option>phone</option><option>passkey</option>
            </optgroup>
            <optgroup label="Other">
              <option>guest</option><option>wallet</option><option>backend</option><option>jwt</option><option>auth_endpoint</option>
            </optgroup>
          </select>
        </label>

        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          Chain
          <select className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" value={chainKey} onChange={(e) => setChainKey(e.target.value)}>
            {CHAINS.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === "EOA"} onChange={() => setMode("EOA")} /> EOA
          </label>
          <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === "EIP7702"} onChange={() => setMode("EIP7702")} /> EIP-7702
          </label>
          <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === "EIP4337"} onChange={() => setMode("EIP4337")} /> EIP-4337
          </label>
          <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2 ml-auto">
            <input type="checkbox" checked={sponsorGas} onChange={(e) => setSponsorGas(e.target.checked)} /> Sponsor gas
          </label>
        </div>
      </div>

      {/* Strategy-specific inputs */}
      {strategy === "email" && (
        <div className="grid grid-cols-1 gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={doPreAuth}>Send code</button>
            <input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Verification code" className="flex-1 border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>
      )}

      {strategy === "phone" && (
        <div className="grid grid-cols-1 gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (+123...)" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={doPreAuth}>Send code</button>
            <input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Verification code" className="flex-1 border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>
      )}

      {strategy === "backend" && (
        <input value={backendSecret} onChange={(e) => setBackendSecret(e.target.value)} placeholder="Backend walletSecret" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
      )}

      {strategy === "jwt" && (
        <input value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="JWT" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
      )}

      {strategy === "auth_endpoint" && (
        <input value={authPayload} onChange={(e) => setAuthPayload(e.target.value)} placeholder="Auth payload" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
      )}

      {/* Metadata / UI options */}
      <div className="grid grid-cols-2 gap-2">
        <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="App name (Connect UI)" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
        <input value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="Icon URL" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" />
      </div>
      <label className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
        <input type="checkbox" checked={hideKeyExport} onChange={(e) => setHideKeyExport(e.target.checked)} /> Hide private key export button
      </label>

      <div className="flex gap-2">
        <button type="button" className="btn-secondary" onClick={connect}>Connect</button>
      </div>

      {address && (
        <div className="text-xs text-zinc-600 dark:text-zinc-300 break-all">
          Connected: {address}
          <div className="mt-2">
            <button
              type="button"
              className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
              onClick={async () => {
                try {
                  const client = getThirdwebClient();
                  const wallet = inAppWallet();
                  const tok = await wallet.getAuthToken();
                  setShowToken(tok || "(no token)");
                } catch (e: any) {
                  setShowToken(e?.message || "failed");
                }
              }}
            >
              Get auth token
            </button>
          </div>
        </div>
      )}
      {showToken && (
        <div className="text-[10px] p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-all">
          {showToken}
        </div>
      )}

      {status && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{status}</p>
      )}
    </div>
  );
}

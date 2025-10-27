"use client"; // only for App Router

import { useEffect, useState } from "react";
import { MetaMaskSDK } from "@metamask/sdk";

const MetaMaskPage = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const connectMetaMask = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "CarbonX - Carbon Credits Platform",
            url: typeof window !== "undefined" ? window.location.href : "",
          },
          infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || undefined,
        });

        const ethereum = MMSDK.getProvider();
        const accounts = await MMSDK.connect();
        setAccount(accounts[0]);
      } catch (err) {
        console.error("MetaMask connection failed", err);
      }
    };

    connectMetaMask();
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h2>MetaMask Connect in CarbonX</h2>
      {account ? <p>Connected: {account}</p> : <p>Connecting...</p>}
    </main>
  );
};

export default MetaMaskPage;

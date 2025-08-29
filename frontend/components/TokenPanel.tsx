"use client";

import { useState } from "react";
import { getSigner, getCarbonTokenContract } from "../utils/web3";

// Minimal ABI for ERC20 balanceOf and mint (owner-only)
const abi = [
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount)"
];

export default function TokenPanel() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("-");
  const [mintAmount, setMintAmount] = useState<number>(100);

  async function fetchBalance() {
    const signer = await getSigner();
    const addr = await signer.getAddress();
    const contract = getCarbonTokenContract(contractAddress, abi, signer);
    const bal = await contract.balanceOf(addr);
    setBalance(bal.toString());
  }

  async function mint() {
    const signer = await getSigner();
    const addr = await signer.getAddress();
    const contract = getCarbonTokenContract(contractAddress, abi, signer);
    const tx = await contract.mint(addr, mintAmount);
    await tx.wait();
    await fetchBalance();
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold text-green-700 mb-2">Carbon Token</h3>
      <input placeholder="Deployed Token Address" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} className="border p-2 rounded w-full mb-2" />
      <div className="flex gap-2 mb-2">
        <button onClick={fetchBalance} className="px-4 py-2 bg-gray-700 text-white rounded">Get My Balance</button>
        <input type="number" value={mintAmount} onChange={(e) => setMintAmount(parseInt(e.target.value))} className="border p-2 rounded w-24" />
        <button onClick={mint} className="px-4 py-2 bg-green-600 text-white rounded">Mint</button>
      </div>
      <p className="text-gray-700">Balance: {balance}</p>
    </div>
  );
}

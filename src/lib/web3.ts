import { ethers } from "ethers";

export function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  throw new Error("No injected web3 provider found. Install MetaMask.");
}

export async function getSigner() {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}

export function getCarbonTokenContract(address: string, abi: any, signerOrProvider: any) {
  return new ethers.Contract(address, abi, signerOrProvider);
}

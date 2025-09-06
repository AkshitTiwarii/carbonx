// Smart Contract Configuration for CarbonX Marketplace
// Auto-generated deployment configuration

export const CONTRACTS = {
  // ERC1155 Multi-token contract for unique carbon credit projects
  CarbonCreditToken: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: [] // ABI will be loaded dynamically from artifacts
  },
  
  // ERC20 Fungible token for DeFi integration
  CarbonXToken: {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 
    abi: [] // ABI will be loaded dynamically from artifacts
  }
};

export const NETWORK_CONFIG = {
  chainId: 31337,
  name: "localhost",
  rpcUrl: "http://127.0.0.1:8545",
  blockExplorer: null
};

export const DEPLOYMENT_INFO = {
  deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  deploymentTime: "2025-09-06T17:07:49.266Z",
  network: "localhost"
};

// Test accounts from Hardhat local node
export const TEST_ACCOUNTS = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    balance: "10000 ETH"
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    balance: "10000 ETH"
  }
  // Additional accounts available in Hardhat output above
];

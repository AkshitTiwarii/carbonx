import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('ts-node/register');

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        // Add your private key here when ready to deploy
        // "0xYOUR_PRIVATE_KEY_HERE"
      ],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "YOUR_POLYGONSCAN_API_KEY", // Optional for verification
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;

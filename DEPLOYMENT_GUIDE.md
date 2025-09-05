# Carbon Credit Token Deployment Guide

## Smart Contract Deployment

### Prerequisites
1. **MetaMask Wallet** with Polygon Mumbai testnet configured
2. **Test MATIC** tokens from [Mumbai Faucet](https://faucet.polygon.technology/)
3. **Private Key** from your MetaMask wallet (keep this secure!)

### Step 1: Configure Private Key
1. Export your private key from MetaMask (Account menu > Account details > Export private key)
2. Create a `.env` file in the `smart_contracts` folder:
```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### Step 2: Deploy to Mumbai Testnet
```bash
cd smart_contracts
npx hardhat run scripts/deploy.ts --network polygonMumbai
```

### Step 3: Update Frontend Configuration
After deployment, copy the contract address and update `.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

## Local Development (Recommended for Testing)

### Step 1: Start Local Blockchain
```bash
cd smart_contracts
npx hardhat node
```

### Step 2: Deploy to Local Network
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Step 3: Connect MetaMask to Local Network
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

## Testing the Marketplace

### 1. Access the Marketplace
- Visit: http://localhost:3000/marketplace
- Connect your MetaMask wallet

### 2. Create a Carbon Credit Project
- Click "Create Project" tab
- Fill in project details:
  - **Name**: e.g., "Amazon Forest Conservation"
  - **Methodology**: VCS, Gold Standard, etc.
  - **CO₂ Tonnes**: Amount of carbon credits to create
  - **Price per Tonne**: Price in ETH (e.g., 0.01)
  - **Location**: Project location
  - **Expiry Date**: When credits expire

### 3. Mint Carbon Credits
- After creating a project, credits are automatically minted to your wallet
- Check your portfolio in the "Portfolio" tab

### 4. List Credits for Sale
- In your portfolio, click "List for Sale" on any credits you own
- Set your selling price
- Your listing will appear in the marketplace

### 5. Buy Carbon Credits
- Browse the marketplace for available credits
- Click "Buy Credits" to purchase with ETH
- Credits will be transferred to your wallet

## Smart Contract Features

### ERC1155 Multi-Token Standard
- Each token ID represents a different carbon credit project
- Each token = 1 carbon credit = 1 ton CO₂ offset
- Efficient batch operations for minting and transfers

### Marketplace Functions
- **Create Project**: Authorized issuers can create new carbon credit projects
- **Mint Credits**: Issue carbon credits for verified projects
- **List for Sale**: Token holders can list credits on the marketplace
- **Buy Credits**: Purchase credits with ETH payments
- **Cancel Listing**: Remove your listings from the marketplace

### Security Features
- **Authorized Issuers**: Only approved entities can create projects
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownership Controls**: Proper access control for admin functions
- **Safe Transfers**: Built-in safety checks for all transfers

## Polygon Mainnet Deployment (Production)

⚠️ **For production use only**

1. Get real MATIC tokens
2. Update hardhat.config.ts with Polygon mainnet RPC
3. Deploy with `--network polygon`
4. Verify contract on PolygonScan

## Contract Verification (Optional)

After deployment, verify your contract:
```bash
npx hardhat verify --network polygonMumbai YOUR_CONTRACT_ADDRESS
```

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure you have enough test MATIC for gas fees
   - Get more from the Mumbai faucet

2. **"Network error"**
   - Check MetaMask is connected to the correct network
   - Verify RPC URL is working

3. **"Contract not deployed"**
   - Ensure deployment was successful
   - Check the contract address in logs

4. **"Transaction failed"**
   - Increase gas limit in MetaMask
   - Check if you have approval for token transfers

### Support

- Check browser console for detailed error messages
- Ensure all dependencies are installed with `npm install`
- Restart development server if needed

## Next Steps

1. **Deploy to Mumbai Testnet** for public testing
2. **Add Uniswap Integration** for automated market making
3. **Implement Carbon Project Verification** with oracles
4. **Add NFT Metadata** for rich project information
5. **Integrate with Carbon Registries** (VCS, Gold Standard)

Your carbon credit marketplace is now ready! 🌱

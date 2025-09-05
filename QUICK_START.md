# Quick Start: Deploy Carbon Credit Token

## 🚀 Test the Marketplace Locally (Recommended)

### Step 1: Start Local Blockchain
```bash
cd smart_contracts
npx hardhat node
```
This starts a local blockchain at `http://127.0.0.1:8545`

### Step 2: Deploy Contract Locally
In a new terminal:
```bash
cd smart_contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Step 3: Update Frontend
Copy the deployed contract address from the deployment output and update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_LOCAL_CONTRACT_ADDRESS
```

### Step 4: Connect MetaMask to Local Network
1. Open MetaMask
2. Add Custom Network:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### Step 5: Import Test Account
Copy one of the private keys from the hardhat node output and import it into MetaMask for testing.

### Step 6: Test the Marketplace
1. Visit: http://localhost:3000/marketplace
2. Connect your MetaMask wallet
3. Create carbon credit projects
4. Mint and trade credits

## 🌍 Deploy to Polygon Mumbai Testnet

### Prerequisites
- Get test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)
- Export your MetaMask private key

### Step 1: Configure Private Key
Create `smart_contracts/.env`:
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### Step 2: Deploy to Mumbai
```bash
cd smart_contracts
npx hardhat run scripts/deploy.ts --network polygonMumbai
```

### Step 3: Update Frontend for Mumbai
Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_MUMBAI_CONTRACT_ADDRESS
NEXT_PUBLIC_NETWORK_ID=80001
```

## ✅ Current Status

**✅ Smart Contract**: ERC1155 with marketplace functionality  
**✅ Frontend**: React marketplace interface with ThirdWeb v5  
**✅ Features**: Create projects, mint credits, buy/sell tokens  
**✅ Security**: OpenZeppelin contracts, ReentrancyGuard  
**✅ Networks**: Local testing + Polygon Mumbai ready  

## 🔧 Troubleshooting

**Issue**: "Module not found: @thirdweb-dev/react"  
**Solution**: ✅ Fixed - Now using ThirdWeb v5 syntax

**Issue**: "getContract validation error"  
**Solution**: Deploy contract and update CONTRACT_ADDRESS

**Issue**: "Insufficient funds for gas"  
**Solution**: Get test MATIC from Mumbai faucet

Your carbon credit marketplace is ready to deploy! 🌱

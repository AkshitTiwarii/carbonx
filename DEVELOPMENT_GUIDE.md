# CarbonX Development Setup Instructions

## To avoid cache errors and process conflicts, follow this order:

### 1. Start Blockchain (First Terminal)
```bash
cd smart_contracts
npx hardhat node
```
**Keep this terminal open and running**

### 2. Deploy Contract (Second Terminal)
```bash
cd smart_contracts
npx hardhat run scripts/deploy.js --network localhost
```
**Copy the contract address from output**

### 3. Update Environment File
Edit `.env.local` and update:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_NEW_CONTRACT_ADDRESS>
```

### 4. Start Development Server (Third Terminal)
```bash
npm run dev
```

## Quick Commands:
- `npm run blockchain` - Start blockchain
- `npm run deploy` - Deploy contract
- `npm run dev` - Start web server
- `npm run dev:clean` - Start web server with clean cache

## If you get cache errors:
1. Close development server (Ctrl+C)
2. Delete `.next` folder manually
3. Restart: `npm run dev`

## Contract Address Changes:
Every time you restart the blockchain, you get a new contract address. 
Update `.env.local` with the new address after each deployment.

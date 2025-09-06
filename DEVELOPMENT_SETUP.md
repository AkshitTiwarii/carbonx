# 🛠️ Complete Development Setup Guide

## Current Status ✅

✅ **Smart Contracts Deployed Successfully**
- CarbonCreditToken (ERC1155): `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- CarbonXToken (ERC20): `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- Network: Hardhat Local (Chain ID: 31337)

✅ **Frontend Configuration Complete**
- Next.js application running at http://localhost:3000
- Environment variables configured
- Development mode enabled

## 🔧 MetaMask Setup (Required for Testing)

### Step 1: Add Hardhat Local Network to MetaMask

1. Open MetaMask browser extension
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" at the bottom
4. Select "Add a network manually"
5. Enter the following details:

```
Network Name: Hardhat Local
New RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

6. Click "Save"

### Step 2: Import Test Account

1. In MetaMask, click the account icon (circle) at the top right
2. Select "Import Account"
3. Choose "Private Key" as the import method
4. Enter this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
5. Click "Import"

**Account Details:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Balance: 10,000 ETH (test tokens)

⚠️ **Warning**: This private key is for development only. Never use it on mainnet!

### Step 3: Switch to Hardhat Local Network

1. Click the network dropdown in MetaMask
2. Select "Hardhat Local" from your networks
3. Ensure you're using the imported test account

## 🚀 Testing the Application

### Current Features Available:

1. **Network Diagnostics** - Real-time system health monitoring
2. **MetaMask Integration** - Wallet connection with circuit breaker protection
3. **Carbon Credit Marketplace** - Browse and purchase carbon credits
4. **Error Handling** - Comprehensive error recovery mechanisms

### Testing Checklist:

- [ ] MetaMask connects successfully to Hardhat Local network
- [ ] Account balance shows 10,000 ETH
- [ ] Network Diagnostics shows all systems healthy
- [ ] Marketplace loads without errors
- [ ] Can browse carbon credit listings
- [ ] Contract interactions work (purchase buttons respond)

## 🐛 Troubleshooting

### Issue: "Connection Refused" or "Network Error"

**Cause**: Hardhat node not running or connection issues

**Solution**:
1. Ensure Hardhat node is running: `npx hardhat node --config hardhat.config.cjs`
2. Check the node is accessible at http://127.0.0.1:8545
3. Restart MetaMask if needed
4. Clear browser cache and reload

### Issue: MetaMask Circuit Breaker Error

**Cause**: Too many failed connection attempts

**Solution**:
1. The app includes automatic circuit breaker reset
2. Wait 30 seconds for automatic recovery
3. Or use the "Reset MetaMask" button in Network Diagnostics
4. Manually disconnect and reconnect MetaMask if needed

### Issue: Contract Not Found Error

**Cause**: Contract addresses not matching deployed contracts

**Solution**:
1. Check `.env.local` has correct contract addresses
2. Verify contracts were deployed successfully
3. Restart the frontend application
4. Redeploy contracts if necessary: `npx hardhat run deploy-development.cjs --network hardhat`

### Issue: Wrong Network in MetaMask

**Cause**: MetaMask connected to wrong network

**Solution**:
1. Switch to "Hardhat Local" network in MetaMask
2. Ensure Chain ID is 31337
3. Re-add the network if not visible

## 📁 Important Files

- **Contracts**: `src/contracts/deployments.json`
- **Environment**: `.env.local`
- **Setup Instructions**: `metamask-setup.json`
- **Network Diagnostics**: Available in the app UI

## 🔄 Development Workflow

1. **Start Hardhat Node**: `npx hardhat node --config hardhat.config.cjs`
2. **Deploy Contracts**: `npx hardhat run deploy-development.cjs --network hardhat`
3. **Start Frontend**: `npm run dev`
4. **Configure MetaMask**: Follow setup steps above
5. **Test Features**: Use the application with MetaMask connected

## 🆘 Getting Help

If you encounter issues:
1. Check the Network Diagnostics panel in the app
2. Look at browser console for error messages
3. Verify Hardhat node terminal output
4. Ensure all setup steps were completed correctly

## 🎯 Next Steps

With the current setup, you can:
- Test all marketplace functionality
- Develop new features with hot reload
- Debug smart contract interactions
- Iterate on the user interface

The application is now ready for full development and testing! 🚀

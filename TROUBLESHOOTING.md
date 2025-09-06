# 🔧 CarbonX Troubleshooting Guide

## ⚡ MetaMask Circuit Breaker Error - SOLVED!

The error you're seeing is MetaMask's circuit breaker protection. Here's how to fix it:

### 🚨 **Immediate Solution**

1. **Use the Reset Button**: In the marketplace, click the **"Reset MetaMask Connection"** button in the Network Diagnostics panel

2. **Manual Reset** (if button doesn't work):
   - Open MetaMask → Settings → Advanced → Reset Account
   - **WARNING**: This will clear transaction history but NOT your wallet balance
   - Reconnect to the Hardhat network

### 🛠 **Complete Setup Process**

#### Step 1: Verify Hardhat Node is Running
```bash
# In terminal, run:
cd carbonx
npx hardhat node --config hardhat.config.cjs
```
- Should show: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

#### Step 2: Configure MetaMask Network
1. Open MetaMask
2. Click network dropdown → "Add network manually"
3. Enter:
   - **Network name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency symbol**: `ETH`
4. Click "Save"

#### Step 3: Import Test Account
1. MetaMask → Account menu → "Import Account"
2. Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. This gives you 10,000 ETH for testing

#### Step 4: Verify Connection
- Visit: `http://localhost:3000/marketplace`
- Check Network Diagnostics panel (should show all green)
- Connect wallet if prompted

---

## 🔍 **Error Diagnosis**

### Circuit Breaker Error
```
Error: Execution prevented because the circuit breaker is open
```
**Cause**: Too many failed requests to MetaMask
**Solution**: Use reset button or wait 5-10 minutes

### 401 Resource Loading Errors
```
Failed to load resource: the server responded with a status of 401
```
**Cause**: Contract artifacts not accessible
**Solution**: Restart development server: `npm run dev`

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8545
```
**Cause**: Hardhat node not running
**Solution**: Start node: `npx hardhat node --config hardhat.config.cjs`

---

## ✅ **Verification Checklist**

Before using the marketplace, ensure:

- [ ] ✅ Hardhat node running at `http://127.0.0.1:8545`
- [ ] ✅ MetaMask connected to Hardhat Local network (Chain ID: 31337)
- [ ] ✅ Test account imported with 10,000 ETH
- [ ] ✅ Frontend running at `http://localhost:3000`
- [ ] ✅ Contracts deployed (check deployment info in diagnostics)
- [ ] ✅ Network Diagnostics shows all green

---

## 🎯 **Quick Commands**

```bash
# Start everything
cd carbonx

# Terminal 1: Start Hardhat node
npx hardhat node --config hardhat.config.cjs

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Deploy contracts (if needed)
npx hardhat run deploy-contracts.cjs --network hardhat --config hardhat.config.cjs
```

---

## 🚀 **Current Contract Addresses**

```javascript
// ERC1155 Multi-token (Carbon Credits)
CarbonCreditToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// ERC20 Fungible (CXB Token)  
CarbonXToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

// Network: Hardhat Local (Chain ID: 31337)
// RPC: http://127.0.0.1:8545
```

---

## 🔧 **Advanced Troubleshooting**

### Clear MetaMask Cache
1. MetaMask → Settings → Advanced → Reset Account
2. Reimport test account
3. Reconnect to Hardhat network

### Restart Everything
1. Close MetaMask completely
2. Stop all terminals (Ctrl+C)
3. Restart Hardhat node
4. Restart frontend
5. Redeploy contracts if needed
6. Reopen MetaMask

### Check Port Conflicts
```bash
# Check if port 8545 is in use
netstat -an | findstr 8545

# Kill process if needed (Windows)
taskkill /F /PID <process_id>
```

---

## 📞 **Still Having Issues?**

The Network Diagnostics panel in the marketplace will show you exactly what's wrong and provide specific solutions. Look for:

- **Red indicators**: Show what needs to be fixed
- **Troubleshooting instructions**: Specific to your issue
- **Reset buttons**: Automated fixes
- **Test links**: Verify connections

**Remember**: The circuit breaker error is temporary and will resolve itself, or you can reset it using the tools provided!

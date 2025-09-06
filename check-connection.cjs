const { ethers } = require('ethers');

async function checkConnection() {
  console.log('🔍 Checking CarbonX marketplace connection...\n');
  
  try {
    // Check if Hardhat node is accessible
    console.log('1. Testing Hardhat node connection...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    try {
      const network = await provider.getNetwork();
      console.log('✅ Hardhat node accessible at http://127.0.0.1:8545');
      console.log(`✅ Chain ID: ${network.chainId}`);
    } catch (error) {
      console.log('❌ Cannot connect to Hardhat node');
      console.log('   → Make sure: npx hardhat node --config hardhat.config.cjs is running');
      return;
    }

    // Check contract addresses
    console.log('\n2. Checking contract configuration...');
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const contractMatch = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(.+)/);
      const erc20Match = envContent.match(/NEXT_PUBLIC_ERC20_ADDRESS=(.+)/);
      
      if (contractMatch && erc20Match) {
        const contractAddress = contractMatch[1].trim();
        const erc20Address = erc20Match[1].trim();
        
        console.log('✅ Contract addresses configured:');
        console.log(`   CarbonCreditToken: ${contractAddress}`);
        console.log(`   CarbonXToken: ${erc20Address}`);
        
        // Test contract accessibility
        console.log('\n3. Testing contract accessibility...');
        try {
          const code = await provider.getCode(contractAddress);
          if (code && code !== '0x') {
            console.log('✅ CarbonCreditToken contract deployed and accessible');
          } else {
            console.log('❌ CarbonCreditToken contract not found at address');
            console.log('   → Run: node deploy-unified.cjs');
          }
        } catch (error) {
          console.log('❌ Error checking contract:', error.message);
        }
      } else {
        console.log('❌ Contract addresses not found in .env.local');
      }
    } else {
      console.log('❌ .env.local file not found');
    }

    // Check frontend status
    console.log('\n4. Checking frontend status...');
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        console.log('✅ Frontend accessible at http://localhost:3000');
      } else {
        console.log('❌ Frontend not responding');
        console.log('   → Run: npm run dev');
      }
    } catch (error) {
      console.log('❌ Frontend not accessible');
      console.log('   → Run: npm run dev');
    }

    console.log('\n🎯 Summary:');
    console.log('To use the marketplace:');
    console.log('1. Visit: http://localhost:3000/marketplace');
    console.log('2. Connect MetaMask to "Hardhat Local" network');
    console.log('3. Import account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('4. Use private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
    console.log('5. Test the marketplace features!');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

if (require.main === module) {
  checkConnection();
}

module.exports = { checkConnection };

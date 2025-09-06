// Simple deployment via hardhat console approach
require('dotenv').config({ path: '.env.local' });

task("deploy-mock", "Deploy mock contracts for testing")
    .setAction(async (taskArgs, hre) => {
        console.log('🚀 Deploying mock contracts...');
        
        // Get deployer account
        const [deployer] = await hre.ethers.getSigners();
        console.log(`💼 Deploying with account: ${deployer.address}`);
        
        // Check balance
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);
        
        // Simple storage contract factory
        const StorageContract = await hre.ethers.getContractFactory("SimpleStorage");
        
        // Deploy first contract (CarbonCreditToken mock)
        console.log('📜 Deploying CarbonCreditToken mock...');
        const carbonCredit = await StorageContract.deploy();
        await carbonCredit.waitForDeployment();
        const carbonCreditAddress = await carbonCredit.getAddress();
        console.log(`✅ CarbonCreditToken deployed at: ${carbonCreditAddress}`);
        
        // Deploy second contract (CarbonXToken mock)
        console.log('💎 Deploying CarbonXToken mock...');
        const carbonX = await StorageContract.deploy();
        await carbonX.waitForDeployment();
        const carbonXAddress = await carbonX.getAddress();
        console.log(`✅ CarbonXToken deployed at: ${carbonXAddress}`);
        
        // Update environment variables
        console.log('\n🔧 Updating environment variables...');
        const fs = require('fs');
        const path = require('path');
        
        const envPath = path.join(__dirname, '.env.local');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        const updateEnv = (key, value) => {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        };
        
        updateEnv('NEXT_PUBLIC_CARBON_CREDIT_TOKEN_ADDRESS', carbonCreditAddress);
        updateEnv('NEXT_PUBLIC_CARBON_X_TOKEN_ADDRESS', carbonXAddress);
        updateEnv('NEXT_PUBLIC_CONTRACT_ADDRESS', carbonCreditAddress);
        updateEnv('NEXT_PUBLIC_ERC20_ADDRESS', carbonXAddress);
        updateEnv('NEXT_PUBLIC_CHAIN_ID', '31337');
        updateEnv('NEXT_PUBLIC_RPC_URL', 'http://localhost:8545');
        
        fs.writeFileSync(envPath, envContent.trim() + '\n');
        
        console.log('\n🎉 Deployment completed!');
        console.log(`🏭 CarbonCreditToken: ${carbonCreditAddress}`);
        console.log(`💎 CarbonXToken: ${carbonXAddress}`);
        console.log('✅ Environment variables updated');
        
        return {
            carbonCreditAddress,
            carbonXAddress
        };
    });

module.exports = {};

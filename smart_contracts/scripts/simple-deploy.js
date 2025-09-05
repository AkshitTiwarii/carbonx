const { ethers } = require("hardhat");

async function main() {
  console.log("🌱 Deploying CarbonCreditToken contract...");

  try {
    // Get the ContractFactory and Signers here.
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy the contract
    const carbonCreditToken = await CarbonCreditToken.deploy();
    
    console.log("Waiting for deployment...");
    await carbonCreditToken.waitForDeployment();
    
    const contractAddress = await carbonCreditToken.getAddress();
    console.log("✅ CarbonCreditToken deployed to:", contractAddress);
    
    // Save the address to env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../../.env.local');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update the contract address
      if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
          `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log("✅ Contract address updated in .env.local");
    } catch (error) {
      console.log("⚠️  Could not update .env.local:", error.message);
      console.log("Please manually update NEXT_PUBLIC_CONTRACT_ADDRESS to:", contractAddress);
    }
    
    return contractAddress;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("🎉 Deployment completed successfully!");
    console.log("Contract address:", address);
  })
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  });
